// src/routes/cuotaRoutes.js
import express from "express";
import Cuota from "../models/Cuota.js";
import Prestamo from "../models/Prestamo.js";
import Financiera from "../models/Financiera.js";
import { verificarToken } from "../middlewares/auth.js";
import { calcularMora } from "../utils/calculosPrestamo.js";

const router = express.Router();

router.use(verificarToken);

/**
 * GET /api/cuotas
 * Listar cuotas con filtros
 */
router.get("/", async (req, res) => {
  try {
    const { prestamo, cliente, estado, vencidas, desde, hasta, page = 1, limit = 50 } = req.query;
    
    const filtro = { financiera: req.financieraId };
    
    if (prestamo) filtro.prestamo = prestamo;
    if (cliente) filtro.cliente = cliente;
    if (estado) filtro.estado = estado;
    
    if (vencidas === "true") {
      filtro.fechaVencimiento = { $lt: new Date() };
      filtro.estado = { $in: ["pendiente", "parcial", "vencida"] };
    }
    
    if (desde || hasta) {
      filtro.fechaVencimiento = {};
      if (desde) filtro.fechaVencimiento.$gte = new Date(desde);
      if (hasta) filtro.fechaVencimiento.$lte = new Date(hasta);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [cuotas, total] = await Promise.all([
      Cuota.find(filtro)
        .populate("cliente", "nombre apellido dni")
        .populate("prestamo", "numeroPrestamo")
        .sort({ fechaVencimiento: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Cuota.countDocuments(filtro)
    ]);
    
    res.json({
      cuotas,
      paginacion: {
        total,
        pagina: parseInt(page),
        limite: parseInt(limit),
        paginas: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error al listar cuotas:", error);
    res.status(500).json({ msg: "Error al obtener cuotas" });
  }
});

/**
 * GET /api/cuotas/proximas-vencer
 * Cuotas próximas a vencer (para recordatorios)
 */
router.get("/proximas-vencer", async (req, res) => {
  try {
    const { dias = 7 } = req.query;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + parseInt(dias));
    
    const cuotas = await Cuota.find({
      financiera: req.financieraId,
      estado: "pendiente",
      fechaVencimiento: { $gte: hoy, $lte: limite }
    })
      .populate("cliente", "nombre apellido telefono whatsapp")
      .populate("prestamo", "numeroPrestamo")
      .sort({ fechaVencimiento: 1 });
    
    res.json({ cuotas });
  } catch (error) {
    console.error("Error al obtener cuotas próximas:", error);
    res.status(500).json({ msg: "Error al obtener cuotas" });
  }
});

/**
 * GET /api/cuotas/vencidas
 * Cuotas vencidas sin pagar
 */
router.get("/vencidas", async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const cuotas = await Cuota.find({
      financiera: req.financieraId,
      estado: { $in: ["pendiente", "parcial", "vencida"] },
      fechaVencimiento: { $lt: hoy }
    })
      .populate("cliente", "nombre apellido telefono whatsapp")
      .populate("prestamo", "numeroPrestamo configuracionMora")
      .sort({ fechaVencimiento: 1 });
    
    // Calcular mora para cada cuota
    const financiera = await Financiera.findById(req.financieraId);
    const configMora = financiera.configuracion.mora;
    
    const cuotasConMora = cuotas.map((cuota) => {
      const mora = calcularMora(
        cuota.saldoPendiente,
        cuota.fechaVencimiento,
        configMora.porcentajeDiario,
        configMora.diasGracia
      );
      return {
        ...cuota.toObject(),
        moraCalculada: mora
      };
    });
    
    res.json({ cuotas: cuotasConMora });
  } catch (error) {
    console.error("Error al obtener cuotas vencidas:", error);
    res.status(500).json({ msg: "Error al obtener cuotas" });
  }
});

/**
 * GET /api/cuotas/:id
 * Obtener cuota específica
 */
router.get("/:id", async (req, res) => {
  try {
    const cuota = await Cuota.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    })
      .populate("cliente", "nombre apellido dni")
      .populate("prestamo", "numeroPrestamo tasaInteres");
    
    if (!cuota) {
      return res.status(404).json({ msg: "Cuota no encontrada" });
    }
    
    // Calcular mora si está vencida
    let moraCalculada = null;
    if (cuota.estaVencida) {
      const financiera = await Financiera.findById(req.financieraId);
      const configMora = financiera.configuracion.mora;
      
      moraCalculada = calcularMora(
        cuota.saldoPendiente,
        cuota.fechaVencimiento,
        configMora.porcentajeDiario,
        configMora.diasGracia
      );
    }
    
    res.json({ cuota, moraCalculada });
  } catch (error) {
    console.error("Error al obtener cuota:", error);
    res.status(500).json({ msg: "Error al obtener cuota" });
  }
});

/**
 * PUT /api/cuotas/:id/actualizar-mora
 * Actualizar mora de una cuota
 */
router.put("/:id/actualizar-mora", async (req, res) => {
  try {
    const cuota = await Cuota.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    });
    
    if (!cuota) {
      return res.status(404).json({ msg: "Cuota no encontrada" });
    }
    
    const financiera = await Financiera.findById(req.financieraId);
    const configMora = financiera.configuracion.mora;
    
    const moraCalculada = calcularMora(
      cuota.montoCuota - cuota.montoPagado,
      cuota.fechaVencimiento,
      configMora.porcentajeDiario,
      configMora.diasGracia
    );
    
    cuota.mora = moraCalculada.mora;
    cuota.diasMora = moraCalculada.diasAtraso;
    await cuota.save();
    
    res.json({ msg: "Mora actualizada", cuota, detalleMora: moraCalculada });
  } catch (error) {
    console.error("Error al actualizar mora:", error);
    res.status(500).json({ msg: "Error al actualizar mora" });
  }
});

export default router;
