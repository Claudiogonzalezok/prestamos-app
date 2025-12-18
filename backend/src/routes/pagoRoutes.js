// src/routes/pagoRoutes.js
import express from "express";
import Pago from "../models/Pago.js";
import Cuota from "../models/Cuota.js";
import Prestamo from "../models/Prestamo.js";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";

const router = express.Router();

router.use(verificarToken);

/**
 * GET /api/pagos
 * Listar pagos
 */
router.get("/", async (req, res) => {
  try {
    const { prestamo, cliente, desde, hasta, metodo, page = 1, limit = 50 } = req.query;
    
    const filtro = { financiera: req.financieraId, estado: "confirmado" };
    
    if (prestamo) filtro.prestamo = prestamo;
    if (cliente) filtro.cliente = cliente;
    if (metodo) filtro.metodoPago = metodo;
    
    if (desde || hasta) {
      filtro.fechaPago = {};
      if (desde) filtro.fechaPago.$gte = new Date(desde);
      if (hasta) filtro.fechaPago.$lte = new Date(hasta);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [pagos, total] = await Promise.all([
      Pago.find(filtro)
        .populate("cliente", "nombre apellido")
        .populate("prestamo", "numeroPrestamo")
        .populate("registradoPor", "nombre apellido")
        .sort({ fechaPago: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Pago.countDocuments(filtro)
    ]);
    
    res.json({
      pagos,
      paginacion: {
        total,
        pagina: parseInt(page),
        limite: parseInt(limit),
        paginas: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    res.status(500).json({ msg: "Error al obtener pagos" });
  }
});

/**
 * POST /api/pagos
 * Registrar pago de cuota
 */
router.post("/", verificarPermiso("registrarPagos"), async (req, res) => {
  try {
    const { cuotaId, monto, metodoPago, referencia, notas } = req.body;
    
    // Buscar cuota
    const cuota = await Cuota.findOne({
      _id: cuotaId,
      financiera: req.financieraId
    }).populate("prestamo");
    
    if (!cuota) {
      return res.status(404).json({ msg: "Cuota no encontrada" });
    }
    
    if (cuota.estado === "pagada") {
      return res.status(400).json({ msg: "Esta cuota ya está pagada" });
    }
    
    const montoPago = parseFloat(monto);
    const totalAPagar = cuota.montoCuota + cuota.mora - cuota.montoPagado;
    
    // Distribuir pago: primero mora, luego interés, luego capital
    let restante = montoPago;
    const distribucion = { mora: 0, interes: 0, capital: 0 };
    
    // Pagar mora pendiente
    const moraPendiente = cuota.mora - cuota.moraPagada;
    if (moraPendiente > 0 && restante > 0) {
      distribucion.mora = Math.min(moraPendiente, restante);
      restante -= distribucion.mora;
    }
    
    // Pagar interés pendiente
    const interesPendiente = cuota.interes - cuota.interesPagado;
    if (interesPendiente > 0 && restante > 0) {
      distribucion.interes = Math.min(interesPendiente, restante);
      restante -= distribucion.interes;
    }
    
    // Pagar capital pendiente
    const capitalPendiente = cuota.capital - cuota.capitalPagado;
    if (capitalPendiente > 0 && restante > 0) {
      distribucion.capital = Math.min(capitalPendiente, restante);
      restante -= distribucion.capital;
    }
    
    // Crear pago
    const pago = new Pago({
      financiera: req.financieraId,
      prestamo: cuota.prestamo._id,
      cuota: cuota._id,
      cliente: cuota.cliente,
      registradoPor: req.usuario._id,
      monto: montoPago,
      distribucion,
      tipoPago: montoPago >= totalAPagar ? "cuota" : "parcial",
      metodoPago: metodoPago || "efectivo",
      referencia,
      notas,
      estado: "confirmado"
    });
    
    await pago.save();
    
    // Actualizar cuota
    cuota.montoPagado += montoPago;
    cuota.capitalPagado += distribucion.capital;
    cuota.interesPagado += distribucion.interes;
    cuota.moraPagada += distribucion.mora;
    cuota.saldoPendiente = cuota.totalAPagar - cuota.montoPagado;
    
    if (cuota.saldoPendiente <= 0) {
      cuota.estado = "pagada";
      cuota.fechaPago = new Date();
    } else {
      cuota.estado = "parcial";
    }
    
    await cuota.save();
    
    // Actualizar préstamo
    const prestamo = await Prestamo.findById(cuota.prestamo._id);
    prestamo.totalPagado += montoPago;
    prestamo.capitalPagado += distribucion.capital;
    prestamo.interesPagado += distribucion.interes;
    prestamo.moraPagada += distribucion.mora;
    prestamo.saldoCapital -= distribucion.capital;
    prestamo.saldoInteres -= distribucion.interes;
    prestamo.saldoMora -= distribucion.mora;
    prestamo.saldoTotal = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;
    
    // Verificar si el préstamo está pagado
    if (prestamo.saldoTotal <= 0) {
      prestamo.estado = "finalizado";
    }
    
    await prestamo.save();
    
    res.status(201).json({
      msg: "Pago registrado exitosamente",
      pago,
      cuota,
      recibo: pago.numeroRecibo
    });
    
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ msg: "Error al registrar pago", error: error.message });
  }
});

/**
 * GET /api/pagos/:id
 * Obtener pago específico
 */
router.get("/:id", async (req, res) => {
  try {
    const pago = await Pago.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    })
      .populate("cliente", "nombre apellido dni")
      .populate("prestamo", "numeroPrestamo")
      .populate("cuota", "numeroCuota fechaVencimiento")
      .populate("registradoPor", "nombre apellido");
    
    if (!pago) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }
    
    res.json({ pago });
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({ msg: "Error al obtener pago" });
  }
});

/**
 * PUT /api/pagos/:id/anular
 * Anular pago
 */
router.put("/:id/anular", verificarPermiso("editarPrestamos"), async (req, res) => {
  try {
    const { motivo } = req.body;
    
    const pago = await Pago.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    });
    
    if (!pago) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }
    
    if (pago.estado === "anulado") {
      return res.status(400).json({ msg: "Este pago ya está anulado" });
    }
    
    // Revertir en la cuota
    const cuota = await Cuota.findById(pago.cuota);
    if (cuota) {
      cuota.montoPagado -= pago.monto;
      cuota.capitalPagado -= pago.distribucion.capital;
      cuota.interesPagado -= pago.distribucion.interes;
      cuota.moraPagada -= pago.distribucion.mora;
      cuota.saldoPendiente = cuota.totalAPagar - cuota.montoPagado;
      cuota.estado = cuota.saldoPendiente > 0 ? "pendiente" : "pagada";
      if (cuota.estado === "pendiente" && cuota.estaVencida) {
        cuota.estado = "vencida";
      }
      await cuota.save();
    }
    
    // Revertir en el préstamo
    const prestamo = await Prestamo.findById(pago.prestamo);
    if (prestamo) {
      prestamo.totalPagado -= pago.monto;
      prestamo.capitalPagado -= pago.distribucion.capital;
      prestamo.interesPagado -= pago.distribucion.interes;
      prestamo.moraPagada -= pago.distribucion.mora;
      prestamo.saldoCapital += pago.distribucion.capital;
      prestamo.saldoInteres += pago.distribucion.interes;
      prestamo.saldoMora += pago.distribucion.mora;
      prestamo.saldoTotal = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;
      if (prestamo.estado === "finalizado") {
        prestamo.estado = "activo";
      }
      await prestamo.save();
    }
    
    // Anular pago
    pago.estado = "anulado";
    pago.anulacion = {
      fecha: new Date(),
      motivo,
      anuladoPor: req.usuario._id
    };
    await pago.save();
    
    res.json({ msg: "Pago anulado", pago });
    
  } catch (error) {
    console.error("Error al anular pago:", error);
    res.status(500).json({ msg: "Error al anular pago" });
  }
});

/**
 * GET /api/pagos/resumen/hoy
 * Resumen de pagos del día
 */
router.get("/resumen/hoy", async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const resumen = await Pago.obtenerResumen(req.financieraId, {
      fechaDesde: hoy,
      fechaHasta: manana
    });
    
    res.json({ resumen });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({ msg: "Error al obtener resumen" });
  }
});

export default router;
