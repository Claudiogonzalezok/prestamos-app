// src/models/Prestamo.js
import mongoose from "mongoose";

const prestamoSchema = new mongoose.Schema({
  // Relaciones
  financiera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Financiera",
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  
  // Número de préstamo (autogenerado)
  numeroPrestamo: {
    type: String,
    unique: true
  },
  
  // Montos
  montoSolicitado: {
    type: Number,
    required: [true, "El monto es requerido"],
    min: [1, "El monto debe ser mayor a 0"]
  },
  montoAprobado: {
    type: Number,
    required: true
  },
  montoDesembolsado: {
    type: Number,
    default: 0
  },
  
  // Configuración del préstamo
  tasaInteres: {
    type: Number,
    required: [true, "La tasa de interés es requerida"]
  },
  tipoTasa: {
    type: String,
    enum: ["mensual", "anual"],
    default: "mensual"
  },
  
  sistemaAmortizacion: {
    type: String,
    enum: ["frances", "aleman", "americano"],
    default: "frances"
  },
  
  tipoCuota: {
    type: String,
    enum: ["fija", "variable"],
    default: "fija"
  },
  
  // Plazos
  plazoMeses: {
    type: Number,
    required: [true, "El plazo es requerido"],
    min: [1, "El plazo mínimo es 1 mes"]
  },
  frecuenciaPago: {
    type: String,
    enum: ["semanal", "quincenal", "mensual"],
    default: "mensual"
  },
  
  // Fechas
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaAprobacion: {
    type: Date
  },
  fechaDesembolso: {
    type: Date
  },
  fechaPrimeraCuota: {
    type: Date,
    required: true
  },
  fechaUltimaCuota: {
    type: Date
  },
  fechaCancelacion: {
    type: Date
  },
  
  // Totales calculados
  totalIntereses: {
    type: Number,
    default: 0
  },
  totalAPagar: {
    type: Number,
    default: 0
  },
  montoCuota: {
    type: Number,
    default: 0
  },
  
  // Saldos actuales
  saldoCapital: {
    type: Number,
    default: 0
  },
  saldoInteres: {
    type: Number,
    default: 0
  },
  saldoMora: {
    type: Number,
    default: 0
  },
  saldoTotal: {
    type: Number,
    default: 0
  },
  
  // Pagos
  totalPagado: {
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
  
  // Mora
  configuracionMora: {
    habilitada: { type: Boolean, default: true },
    porcentajeDiario: { type: Number, default: 0.5 },
    diasGracia: { type: Number, default: 0 }
  },
  
  // Cancelación anticipada
  cancelacionAnticipada: {
    habilitada: { type: Boolean, default: true },
    descuentoPorDia: { type: Number, default: 0.1 }
  },
  
  // Estado
  estado: {
    type: String,
    enum: [
      "solicitud",      // Solicitud inicial
      "en_revision",    // En análisis
      "aprobado",       // Aprobado, pendiente de desembolso
      "rechazado",      // Rechazado
      "activo",         // En curso, con cuotas pendientes
      "atrasado",       // Con cuotas vencidas
      "cancelado",      // Cancelado anticipadamente
      "finalizado"      // Pagado completamente
    ],
    default: "solicitud"
  },
  
  // Motivo de rechazo (si aplica)
  motivoRechazo: {
    type: String
  },
  
  // Destino del préstamo
  destino: {
    type: String,
    enum: ["personal", "vehiculo", "vivienda", "negocio", "educacion", "salud", "otro"],
    default: "personal"
  },
  descripcionDestino: {
    type: String
  },
  
  // Garantía (si tiene)
  garantia: {
    tipo: {
      type: String,
      enum: ["sin_garantia", "garante", "vehiculo", "inmueble", "otro"]
    },
    descripcion: String,
    valor: Number
  },
  
  // Documentos del préstamo
  documentos: [{
    tipo: {
      type: String,
      enum: ["contrato", "pagare", "recibo", "otro"]
    },
    nombre: String,
    url: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notas internas
  notas: [{
    texto: String,
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario"
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices
prestamoSchema.index({ financiera: 1, numeroPrestamo: 1 });
prestamoSchema.index({ financiera: 1, cliente: 1 });
prestamoSchema.index({ financiera: 1, estado: 1 });
prestamoSchema.index({ fechaPrimeraCuota: 1 });

// Pre-save: generar número de préstamo
prestamoSchema.pre("save", async function(next) {
  if (this.isNew && !this.numeroPrestamo) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ 
      financiera: this.financiera,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.numeroPrestamo = `PRE-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Virtual: porcentaje pagado
prestamoSchema.virtual("porcentajePagado").get(function() {
  if (this.totalAPagar === 0) return 0;
  return Math.round((this.totalPagado / this.totalAPagar) * 100);
});

// Virtual: cuotas pendientes
prestamoSchema.virtual("cuotasPendientes").get(function() {
  // Se calculará con la relación a Cuota
  return null;
});

// Virtual: días de atraso máximo
prestamoSchema.virtual("diasAtraso").get(function() {
  // Se calculará con la relación a Cuota
  return null;
});

// Método: calcular cuotas sistema francés
prestamoSchema.methods.calcularCuotasFrances = function() {
  const capital = this.montoAprobado;
  const tasaMensual = this.tipoTasa === "anual" 
    ? this.tasaInteres / 100 / 12 
    : this.tasaInteres / 100;
  const n = this.plazoMeses;
  
  // Fórmula sistema francés: C = P * [r(1+r)^n] / [(1+r)^n - 1]
  const cuota = capital * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
  
  let saldo = capital;
  const cuotas = [];
  
  for (let i = 1; i <= n; i++) {
    const interes = saldo * tasaMensual;
    const amortizacion = cuota - interes;
    saldo -= amortizacion;
    
    cuotas.push({
      numeroCuota: i,
      montoCuota: Math.round(cuota * 100) / 100,
      capital: Math.round(amortizacion * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      saldoRestante: Math.round(Math.max(saldo, 0) * 100) / 100
    });
  }
  
  return cuotas;
};

// Método: calcular cuotas sistema alemán
prestamoSchema.methods.calcularCuotasAleman = function() {
  const capital = this.montoAprobado;
  const tasaMensual = this.tipoTasa === "anual" 
    ? this.tasaInteres / 100 / 12 
    : this.tasaInteres / 100;
  const n = this.plazoMeses;
  
  // Sistema alemán: amortización constante
  const amortizacion = capital / n;
  
  let saldo = capital;
  const cuotas = [];
  
  for (let i = 1; i <= n; i++) {
    const interes = saldo * tasaMensual;
    const cuota = amortizacion + interes;
    saldo -= amortizacion;
    
    cuotas.push({
      numeroCuota: i,
      montoCuota: Math.round(cuota * 100) / 100,
      capital: Math.round(amortizacion * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      saldoRestante: Math.round(Math.max(saldo, 0) * 100) / 100
    });
  }
  
  return cuotas;
};

// Método: calcular monto cancelación anticipada
prestamoSchema.methods.calcularCancelacionAnticipada = function() {
  if (!this.cancelacionAnticipada.habilitada) {
    return { permitido: false, mensaje: "Cancelación anticipada no habilitada" };
  }
  
  // Calcular días restantes hasta última cuota
  const hoy = new Date();
  const ultimaCuota = new Date(this.fechaUltimaCuota);
  const diasRestantes = Math.ceil((ultimaCuota - hoy) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes <= 0) {
    return { permitido: false, mensaje: "El préstamo ya venció" };
  }
  
  // Calcular descuento
  const descuento = this.saldoInteres * (this.cancelacionAnticipada.descuentoPorDia / 100) * diasRestantes;
  const montoFinal = this.saldoCapital + this.saldoInteres + this.saldoMora - descuento;
  
  return {
    permitido: true,
    saldoCapital: this.saldoCapital,
    saldoInteres: this.saldoInteres,
    saldoMora: this.saldoMora,
    diasRestantes,
    descuento: Math.round(descuento * 100) / 100,
    montoFinal: Math.round(Math.max(montoFinal, this.saldoCapital) * 100) / 100
  };
};

prestamoSchema.set("toJSON", { virtuals: true });
prestamoSchema.set("toObject", { virtuals: true });

export default mongoose.model("Prestamo", prestamoSchema);
