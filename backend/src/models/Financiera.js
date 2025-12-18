// src/models/Financiera.js
import mongoose from "mongoose";

const financieraSchema = new mongoose.Schema({
  // Datos básicos
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true
  },
  razonSocial: {
    type: String,
    trim: true
  },
  cuit: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Contacto
  email: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  direccion: {
    calle: String,
    numero: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String
  },
  
  // Configuración de préstamos
  configuracion: {
    // Tasas de interés predefinidas (el usuario puede agregar más)
    tasasInteres: [{
      nombre: String,        // "Tasa estándar", "Tasa preferencial"
      porcentaje: Number,    // 5, 10, 15...
      tipo: {
        type: String,
        enum: ["mensual", "anual"],
        default: "mensual"
      }
    }],
    
    // Mora
    mora: {
      habilitada: {
        type: Boolean,
        default: true
      },
      porcentajeDiario: {
        type: Number,
        default: 0.5  // 0.5% diario
      },
      diasGracia: {
        type: Number,
        default: 0    // Días antes de aplicar mora
      }
    },
    
    // Cancelación anticipada
    cancelacionAnticipada: {
      habilitada: {
        type: Boolean,
        default: true
      },
      descuentoPorDia: {
        type: Number,
        default: 0.1  // % de descuento por cada día anticipado
      }
    },
    
    // Frecuencias de pago disponibles
    frecuenciasPago: [{
      type: String,
      enum: ["semanal", "quincenal", "mensual"],
      default: ["mensual"]
    }],
    
    // Montos
    montoMinimo: {
      type: Number,
      default: 10000
    },
    montoMaximo: {
      type: Number,
      default: 5000000
    },
    
    // Plazos (en meses)
    plazoMinimo: {
      type: Number,
      default: 1
    },
    plazoMaximo: {
      type: Number,
      default: 60
    }
  },
  
  // Branding
  logo: {
    type: String,
    default: null
  },
  colorPrimario: {
    type: String,
    default: "#3B82F6"
  },
  
  // Plan/Suscripción
  plan: {
    type: String,
    enum: ["basico", "profesional", "empresarial"],
    default: "basico"
  },
  limiteClientes: {
    type: Number,
    default: 50  // Plan básico: 50 clientes
  },
  limiteUsuarios: {
    type: Number,
    default: 2   // Plan básico: 2 usuarios
  },
  
  // Estado
  estado: {
    type: String,
    enum: ["activa", "suspendida", "cancelada"],
    default: "activa"
  },
  
  fechaVencimientoPlan: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
financieraSchema.index({ email: 1 });
financieraSchema.index({ estado: 1 });

// Virtuals
financieraSchema.virtual("configuracionMora").get(function() {
  return this.configuracion?.mora || { habilitada: true, porcentajeDiario: 0.5, diasGracia: 0 };
});

financieraSchema.set("toJSON", { virtuals: true });
financieraSchema.set("toObject", { virtuals: true });

export default mongoose.model("Financiera", financieraSchema);
