// src/models/Pago.js
import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema({
  // Relaciones
  financiera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Financiera",
    required: true
  },
  prestamo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prestamo",
    required: true
  },
  cuota: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cuota"
    // Puede ser null si es pago de cancelación anticipada
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  
  // Número de recibo (autogenerado)
  numeroRecibo: {
    type: String,
    unique: true
  },
  
  // Monto
  monto: {
    type: Number,
    required: [true, "El monto es requerido"],
    min: [0.01, "El monto debe ser mayor a 0"]
  },
  
  // Distribución del pago
  distribucion: {
    capital: { type: Number, default: 0 },
    interes: { type: Number, default: 0 },
    mora: { type: Number, default: 0 }
  },
  
  // Tipo de pago
  tipoPago: {
    type: String,
    enum: [
      "cuota",              // Pago normal de cuota
      "adelanto",           // Pago adelantado
      "parcial",            // Pago parcial de cuota
      "cancelacion",        // Cancelación anticipada
      "refinanciacion"      // Refinanciación
    ],
    default: "cuota"
  },
  
  // Método de pago
  metodoPago: {
    type: String,
    enum: [
      "efectivo",
      "transferencia",
      "deposito",
      "tarjeta_debito",
      "tarjeta_credito",
      "cheque",
      "mercadopago",
      "otro"
    ],
    default: "efectivo"
  },
  
  // Referencia del pago (número de transferencia, etc.)
  referencia: {
    type: String,
    trim: true
  },
  
  // Fecha
  fechaPago: {
    type: Date,
    default: Date.now
  },
  
  // Estado
  estado: {
    type: String,
    enum: ["pendiente", "confirmado", "rechazado", "anulado"],
    default: "confirmado"
  },
  
  // Comprobante adjunto
  comprobante: {
    type: String  // URL del archivo
  },
  
  // Notas
  notas: {
    type: String,
    trim: true
  },
  
  // Anulación
  anulacion: {
    fecha: Date,
    motivo: String,
    anuladoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario"
    }
  }
}, {
  timestamps: true
});

// Índices
pagoSchema.index({ financiera: 1, numeroRecibo: 1 });
pagoSchema.index({ financiera: 1, prestamo: 1 });
pagoSchema.index({ financiera: 1, cliente: 1 });
pagoSchema.index({ financiera: 1, fechaPago: -1 });
pagoSchema.index({ financiera: 1, estado: 1 });

// Pre-save: generar número de recibo
pagoSchema.pre("save", async function(next) {
  if (this.isNew && !this.numeroRecibo) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await this.constructor.countDocuments({
      financiera: this.financiera,
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    });
    this.numeroRecibo = `REC-${year}${month}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Método estático: obtener resumen de pagos
pagoSchema.statics.obtenerResumen = async function(financieraId, filtros = {}) {
  const match = { 
    financiera: new mongoose.Types.ObjectId(financieraId),
    estado: "confirmado"
  };
  
  if (filtros.fechaDesde) {
    match.fechaPago = { $gte: new Date(filtros.fechaDesde) };
  }
  if (filtros.fechaHasta) {
    match.fechaPago = { ...match.fechaPago, $lte: new Date(filtros.fechaHasta) };
  }
  
  const resultado = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRecaudado: { $sum: "$monto" },
        cantidadPagos: { $sum: 1 },
        capitalRecaudado: { $sum: "$distribucion.capital" },
        interesRecaudado: { $sum: "$distribucion.interes" },
        moraRecaudada: { $sum: "$distribucion.mora" }
      }
    }
  ]);
  
  return resultado[0] || {
    totalRecaudado: 0,
    cantidadPagos: 0,
    capitalRecaudado: 0,
    interesRecaudado: 0,
    moraRecaudada: 0
  };
};

// Método estático: pagos por método
pagoSchema.statics.agruparPorMetodo = async function(financieraId, fechaDesde, fechaHasta) {
  return await this.aggregate([
    {
      $match: {
        financiera: new mongoose.Types.ObjectId(financieraId),
        estado: "confirmado",
        fechaPago: {
          $gte: new Date(fechaDesde),
          $lte: new Date(fechaHasta)
        }
      }
    },
    {
      $group: {
        _id: "$metodoPago",
        total: { $sum: "$monto" },
        cantidad: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

pagoSchema.set("toJSON", { virtuals: true });
pagoSchema.set("toObject", { virtuals: true });

export default mongoose.model("Pago", pagoSchema);
