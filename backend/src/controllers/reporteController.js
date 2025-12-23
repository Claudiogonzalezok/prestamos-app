// src/controllers/reporteController.js
import Prestamo from "../models/Prestamo.js";
import Cuota from "../models/Cuota.js";
import Pago from "../models/Pago.js";
import Cliente from "../models/Cliente.js";

/**
 * Datos para el dashboard principal
 */
export const dashboard = async (req, res) => {
  try {
    const financieraId = req.financieraId;
    
    const [
      totalClientes,
      clientesActivos,
      totalPrestamos,
      prestamosActivos,
      prestamosAtrasados
    ] = await Promise.all([
      Cliente.countDocuments({ financiera: financieraId }),
      Cliente.countDocuments({ financiera: financieraId, estado: "activo" }),
      Prestamo.countDocuments({ financiera: financieraId }),
      Prestamo.countDocuments({ financiera: financieraId, estado: "activo" }),
      Prestamo.countDocuments({ financiera: financieraId, estado: "atrasado" })
    ]);
    
    const montosPrestamos = await Prestamo.aggregate([
      { $match: { financiera: financieraId, estado: { $in: ["activo", "atrasado"] } } },
      {
        $group: {
          _id: null,
          capitalPrestado: { $sum: "$montoDesembolsado" },
          saldoCapital: { $sum: "$saldoCapital" },
          saldoTotal: { $sum: "$saldoTotal" },
          totalRecuperado: { $sum: "$totalPagado" }
        }
      }
    ]);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const cuotasVencidas = await Cuota.aggregate([
      {
        $match: {
          financiera: financieraId,
          estado: { $in: ["pendiente", "parcial", "vencida"] },
          fechaVencimiento: { $lt: hoy }
        }
      },
      {
        $group: {
          _id: null,
          cantidad: { $sum: 1 },
          montoTotal: { $sum: "$saldoPendiente" }
        }
      }
    ]);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const pagosMes = await Pago.obtenerResumen(financieraId, {
      fechaDesde: inicioMes,
      fechaHasta: hoy
    });
    
    res.json({
      clientes: {
        total: totalClientes,
        activos: clientesActivos
      },
      prestamos: {
        total: totalPrestamos,
        activos: prestamosActivos,
        atrasados: prestamosAtrasados,
        ...(montosPrestamos[0] || {
          capitalPrestado: 0,
          saldoCapital: 0,
          saldoTotal: 0,
          totalRecuperado: 0
        })
      },
      cuotasVencidas: cuotasVencidas[0] || { cantidad: 0, montoTotal: 0 },
      pagosMes
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ msg: "Error al obtener dashboard" });
  }
};

/**
 * Reporte de cartera
 */
export const cartera = async (req, res) => {
  try {
    const cartera = await Prestamo.aggregate([
      { $match: { financiera: req.financieraId } },
      {
        $group: {
          _id: "$estado",
          cantidad: { $sum: 1 },
          montoTotal: { $sum: "$montoAprobado" },
          saldoTotal: { $sum: "$saldoTotal" }
        }
      }
    ]);
    
    res.json({ cartera });
  } catch (error) {
    console.error("Error en reporte cartera:", error);
    res.status(500).json({ msg: "Error al obtener reporte" });
  }
};

/**
 * Reporte de cobranza
 */
export const cobranza = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const fechaDesde = desde ? new Date(desde) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const fechaHasta = hasta ? new Date(hasta) : new Date();
    
    const cobranza = await Pago.aggregate([
      {
        $match: {
          financiera: req.financieraId,
          estado: "confirmado",
          fechaPago: { $gte: fechaDesde, $lte: fechaHasta }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fechaPago" } },
          total: { $sum: "$monto" },
          cantidad: { $sum: 1 },
          capital: { $sum: "$distribucion.capital" },
          interes: { $sum: "$distribucion.interes" },
          mora: { $sum: "$distribucion.mora" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ cobranza });
  } catch (error) {
    console.error("Error en reporte cobranza:", error);
    res.status(500).json({ msg: "Error al obtener reporte" });
  }
};

/**
 * Reporte de morosidad
 */
export const morosidad = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const morosidad = await Cuota.aggregate([
      {
        $match: {
          financiera: req.financieraId,
          estado: { $in: ["pendiente", "parcial", "vencida"] },
          fechaVencimiento: { $lt: hoy }
        }
      },
      {
        $lookup: {
          from: "clientes",
          localField: "cliente",
          foreignField: "_id",
          as: "clienteInfo"
        }
      },
      { $unwind: "$clienteInfo" },
      {
        $group: {
          _id: "$cliente",
          cliente: { $first: "$clienteInfo" },
          cuotasVencidas: { $sum: 1 },
          montoVencido: { $sum: "$saldoPendiente" },
          diasMaxAtraso: { $max: { $divide: [{ $subtract: [hoy, "$fechaVencimiento"] }, 86400000] } }
        }
      },
      { $sort: { montoVencido: -1 } }
    ]);
    
    res.json({ morosidad });
  } catch (error) {
    console.error("Error en reporte morosidad:", error);
    res.status(500).json({ msg: "Error al obtener reporte" });
  }
};
