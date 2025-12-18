// src/models/Cuota.js
import mongoose from "mongoose";

const cuotaSchema = new mongoose.Schema({
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
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  
  // Identificación
  numeroCuota: {
    type: Number,
    required: true
  },
  
  // Montos originales
  montoCuota: {
    type: Number,
    required: true
  },
  capital: {
    type: Number,
    required: true
  },
  interes: {
    type: Number,
    required: true
  },
  
  // Mora
  mora: {
    type: Number,
    default: 0
  },
  diasMora: {
    type: Number,
    default: 0
  },
  
  // Total a pagar (cuota + mora)
  totalAPagar: {
    type: Number,
    required: true
  },
  
  // Pagado
  montoPagado: {
    type: Number,
    default: 0
  },
  capitalPagado: {
    type: Number,
    default: 0
  },
  interesPagado: {
    type: Number,
    default: 0
  },
  moraPagada: {
    type: Number,
    default: 0
  },
  
  // Saldo pendiente
  saldoPendiente: {
    type: Number,
    required: true
  },
  
  // Fechas
  fechaVencimiento: {
    type: Date,
    required: true
  },
  fechaPago: {
    type: Date
  },
  
  // Estado
  estado: {
    type: String,
    enum: [
      "pendiente",      // Aún no vence
      "vencida",        // Venció y no se pagó
      "parcial",        // Pago parcial
      "pagada",         // Pagada completa
      "condonada"       // Perdonada/anulada
    ],
    default: "pendiente"
  },
  
  // Saldo restante del préstamo después de esta cuota
  saldoRestante: {
    type: Number,
    default: 0
  },
  
  // Notas
  notas: {
    type: String
  }
}, {
  timestamps: true
});

// Índices
cuotaSchema.index({ financiera: 1, prestamo: 1, numeroCuota: 1 }, { unique: true });
cuotaSchema.index({ financiera: 1, cliente: 1 });
cuotaSchema.index({ financiera: 1, fechaVencimiento: 1 });
cuotaSchema.index({ financiera: 1, estado: 1 });

// Virtual: está vencida
cuotaSchema.virtual("estaVencida").get(function() {
  if (this.estado === "pagada" || this.estado === "condonada") return false;
  return new Date() > new Date(this.fechaVencimiento);
});

// Virtual: días de atraso
cuotaSchema.virtual("diasAtraso").get(function() {
  if (!this.estaVencida) return 0;
  const hoy = new Date();
  const vencimiento = new Date(this.fechaVencimiento);
  return Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24));
});

// Método: calcular mora
cuotaSchema.methods.calcularMora = function(configuracionMora) {
  if (!configuracionMora.habilitada) return 0;
  
  const diasAtraso = this.diasAtraso;
  if (diasAtraso <= configuracionMora.diasGracia) return 0;
  
  const diasEfectivos = diasAtraso - configuracionMora.diasGracia;
  const mora = this.saldoPendiente * (configuracionMora.porcentajeDiario / 100) * diasEfectivos;
  
  return Math.round(mora * 100) / 100;
};

// Método: actualizar estado según pagos y vencimiento
cuotaSchema.methods.actualizarEstado = function() {
  if (this.saldoPendiente <= 0) {
    this.estado = "pagada";
  } else if (this.montoPagado > 0 && this.saldoPendiente > 0) {
    this.estado = "parcial";
  } else if (this.estaVencida) {
    this.estado = "vencida";
  } else {
    this.estado = "pendiente";
  }
  return this.estado;
};

// Pre-save: actualizar totalAPagar y estado
cuotaSchema.pre("save", function(next) {
  // Actualizar total a pagar
  this.totalAPagar = this.montoCuota + this.mora;
  
  // Calcular saldo pendiente
  this.saldoPendiente = this.totalAPagar - this.montoPagado;
  
  // Actualizar estado
  this.actualizarEstado();
  
  next();
});

cuotaSchema.set("toJSON", { virtuals: true });
cuotaSchema.set("toObject", { virtuals: true });

export default mongoose.model("Cuota", cuotaSchema);
