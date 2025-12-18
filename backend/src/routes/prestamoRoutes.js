// src/routes/prestamoRoutes.js
import express from "express";
import Prestamo from "../models/Prestamo.js";
import Cuota from "../models/Cuota.js";
import Cliente from "../models/Cliente.js";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";
import { 
  calcularSistemaFrances, 
  calcularSistemaAleman,
  simularPrestamo,
  calcularFechaUltimaCuota 
} from "../utils/calculosPrestamo.js";

const router = express.Router();

router.use(verificarToken);

/**
 * POST /api/prestamos/simular
 * Simular préstamo sin crearlo
 */
router.post("/simular", async (req, res) => {
  try {
    const { capital, tasaInteres, tipoTasa, plazoMeses, sistema, frecuencia, fechaPrimeraCuota } = req.body;
    
    if (!capital || !tasaInteres || !plazoMeses) {
      return res.status(400).json({ msg: "Capital, tasa y plazo son requeridos" });
    }
    
    const simulacion = simularPrestamo({
      capital: parseFloat(capital),
      tasaInteres: parseFloat(tasaInteres),
      tipoTasa: tipoTasa || "mensual",
      plazoMeses: parseInt(plazoMeses),
      sistema: sistema || "frances",
      frecuencia: frecuencia || "mensual",
      fechaPrimeraCuota: fechaPrimeraCuota ? new Date(fechaPrimeraCuota) : new Date()
    });
    
    res.json({ simulacion });
  } catch (error) {
    console.error("Error en simulación:", error);
    res.status(500).json({ msg: "Error al simular préstamo" });
  }
});

/**
 * GET /api/prestamos
 * Listar préstamos
 */
router.get("/", async (req, res) => {
  try {
    const { estado, cliente, page = 1, limit = 20 } = req.query;
    
    const filtro = { financiera: req.financieraId };
    if (estado) filtro.estado = estado;
    if (cliente) filtro.cliente = cliente;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [prestamos, total] = await Promise.all([
      Prestamo.find(filtro)
        .populate("cliente", "nombre apellido dni")
        .populate("creadoPor", "nombre apellido")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prestamo.countDocuments(filtro)
    ]);
    
    res.json({
      prestamos,
      paginacion: {
        total,
        pagina: parseInt(page),
        limite: parseInt(limit),
        paginas: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error al listar préstamos:", error);
    res.status(500).json({ msg: "Error al obtener préstamos" });
  }
});

/**
 * GET /api/prestamos/:id
 * Obtener préstamo con cuotas
 */
router.get("/:id", async (req, res) => {
  try {
    const prestamo = await Prestamo.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    })
      .populate("cliente", "nombre apellido dni email telefono")
      .populate("creadoPor", "nombre apellido");
    
    if (!prestamo) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }
    
    const cuotas = await Cuota.find({ prestamo: prestamo._id })
      .sort({ numeroCuota: 1 });
    
    res.json({ prestamo, cuotas });
  } catch (error) {
    console.error("Error al obtener préstamo:", error);
    res.status(500).json({ msg: "Error al obtener préstamo" });
  }
});

/**
 * POST /api/prestamos
 * Crear préstamo
 */
router.post("/", verificarPermiso("crearPrestamos"), async (req, res) => {
  try {
    const {
      clienteId,
      montoSolicitado,
      tasaInteres,
      tipoTasa,
      plazoMeses,
      sistemaAmortizacion,
      tipoCuota,
      frecuenciaPago,
      fechaPrimeraCuota,
      destino,
      descripcionDestino
    } = req.body;
    
    // Validar cliente
    const cliente = await Cliente.findOne({
      _id: clienteId,
      financiera: req.financieraId
    });
    
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }
    
    // Calcular cuotas
    const monto = parseFloat(montoSolicitado);
    const tasa = parseFloat(tasaInteres);
    const plazo = parseInt(plazoMeses);
    const fechaPrimera = new Date(fechaPrimeraCuota);
    const sistema = sistemaAmortizacion || "frances";
    const frecuencia = frecuenciaPago || "mensual";
    
    let calculo;
    if (sistema === "aleman") {
      calculo = calcularSistemaAleman(monto, tasa, tipoTasa || "mensual", plazo, fechaPrimera, frecuencia);
    } else {
      calculo = calcularSistemaFrances(monto, tasa, tipoTasa || "mensual", plazo, fechaPrimera, frecuencia);
    }
    
    // Crear préstamo
    const prestamo = new Prestamo({
      financiera: req.financieraId,
      cliente: cliente._id,
      creadoPor: req.usuario._id,
      montoSolicitado: monto,
      montoAprobado: monto,
      tasaInteres: tasa,
      tipoTasa: tipoTasa || "mensual",
      sistemaAmortizacion: sistema,
      tipoCuota: tipoCuota || "fija",
      plazoMeses: plazo,
      frecuenciaPago: frecuencia,
      fechaPrimeraCuota: fechaPrimera,
      fechaUltimaCuota: calcularFechaUltimaCuota(fechaPrimera, plazo, frecuencia),
      totalIntereses: calculo.totalIntereses,
      totalAPagar: calculo.totalAPagar,
      montoCuota: calculo.montoCuota || calculo.montoCuotaInicial,
      saldoCapital: monto,
      saldoInteres: calculo.totalIntereses,
      saldoTotal: calculo.totalAPagar,
      destino,
      descripcionDestino,
      estado: "aprobado"
    });
    
    await prestamo.save();
    
    // Crear cuotas
    const cuotasACrear = calculo.cuotas.map((c) => ({
      financiera: req.financieraId,
      prestamo: prestamo._id,
      cliente: cliente._id,
      numeroCuota: c.numeroCuota,
      montoCuota: c.montoCuota,
      capital: c.capital,
      interes: c.interes,
      totalAPagar: c.montoCuota,
      saldoPendiente: c.montoCuota,
      fechaVencimiento: c.fechaVencimiento,
      saldoRestante: c.saldoRestante,
      estado: "pendiente"
    }));
    
    await Cuota.insertMany(cuotasACrear);
    
    // Cambiar estado a activo si se desembolsa
    prestamo.estado = "activo";
    prestamo.fechaAprobacion = new Date();
    prestamo.fechaDesembolso = new Date();
    prestamo.montoDesembolsado = monto;
    await prestamo.save();
    
    res.status(201).json({ 
      msg: "Préstamo creado exitosamente",
      prestamo,
      cuotas: cuotasACrear.length
    });
    
  } catch (error) {
    console.error("Error al crear préstamo:", error);
    res.status(500).json({ msg: "Error al crear préstamo", error: error.message });
  }
});

/**
 * GET /api/prestamos/:id/cancelacion-anticipada
 * Calcular cancelación anticipada
 */
router.get("/:id/cancelacion-anticipada", async (req, res) => {
  try {
    const prestamo = await Prestamo.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    });
    
    if (!prestamo) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }
    
    if (!["activo", "atrasado"].includes(prestamo.estado)) {
      return res.status(400).json({ msg: "El préstamo no está activo" });
    }
    
    const calculo = prestamo.calcularCancelacionAnticipada();
    
    res.json({ cancelacion: calculo });
  } catch (error) {
    console.error("Error al calcular cancelación:", error);
    res.status(500).json({ msg: "Error al calcular cancelación" });
  }
});

/**
 * PUT /api/prestamos/:id/estado
 * Cambiar estado del préstamo
 */
router.put("/:id/estado", verificarPermiso("editarPrestamos"), async (req, res) => {
  try {
    const { estado, motivo } = req.body;
    
    const prestamo = await Prestamo.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    });
    
    if (!prestamo) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }
    
    prestamo.estado = estado;
    if (estado === "rechazado") {
      prestamo.motivoRechazo = motivo;
    }
    if (estado === "cancelado") {
      prestamo.fechaCancelacion = new Date();
    }
    
    await prestamo.save();
    
    res.json({ msg: "Estado actualizado", prestamo });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ msg: "Error al cambiar estado" });
  }
});

export default router;
