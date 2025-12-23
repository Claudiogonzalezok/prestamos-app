// src/controllers/cuotaController.js
import Cuota from "../models/Cuota.js";
import Financiera from "../models/Financiera.js";
import { calcularMora } from "../utils/calculosPrestamo.js";

/**
 * Listar cuotas con filtros
 */
export const listar = async (req, res) => {
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
};

/**
 * Cuotas próximas a vencer
 */
export const proximasVencer = async (req, res) => {
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
};

/**
 * Cuotas vencidas sin pagar
 */
export const vencidas = async (req, res) => {
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
};

/**
 * Obtener cuota específica
 */
export const obtenerPorId = async (req, res) => {
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
};

/**
 * Actualizar mora de una cuota
 */
export const actualizarMora = async (req, res) => {
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
};
