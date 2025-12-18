// src/models/Usuario.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  // Relación con financiera (tenant)
  financiera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Financiera",
    required: true
  },
  
  // Datos básicos
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, "El apellido es requerido"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"]
  },
  
  // Rol dentro de la financiera
  rol: {
    type: String,
    enum: ["admin", "empleado", "cobrador"],
    default: "empleado"
  },
  
  // Permisos específicos
  permisos: {
    crearPrestamos: { type: Boolean, default: true },
    editarPrestamos: { type: Boolean, default: false },
    eliminarPrestamos: { type: Boolean, default: false },
    registrarPagos: { type: Boolean, default: true },
    verReportes: { type: Boolean, default: false },
    gestionarClientes: { type: Boolean, default: true },
    gestionarUsuarios: { type: Boolean, default: false },
    configurarSistema: { type: Boolean, default: false }
  },
  
  // Contacto
  telefono: {
    type: String,
    trim: true
  },
  
  // Imagen de perfil
  imagen: {
    type: String,
    default: null
  },
  
  // Estado
  activo: {
    type: Boolean,
    default: true
  },
  
  // Verificación
  emailVerificado: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Recuperación de contraseña
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Tokens
  refreshToken: String,
  
  // Auditoría
  ultimoAcceso: {
    type: Date
  }
}, {
  timestamps: true
});

// Índice compuesto: email único por financiera
usuarioSchema.index({ financiera: 1, email: 1 }, { unique: true });
usuarioSchema.index({ rol: 1 });

// Virtual: nombre completo
usuarioSchema.virtual("nombreCompleto").get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Virtual: iniciales
usuarioSchema.virtual("iniciales").get(function() {
  return `${this.nombre[0]}${this.apellido[0]}`.toUpperCase();
});

// Método: verificar si tiene permiso
usuarioSchema.methods.tienePermiso = function(permiso) {
  if (this.rol === "admin") return true;
  return this.permisos[permiso] === true;
};

usuarioSchema.set("toJSON", { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.emailVerificationToken;
    delete ret.resetPasswordToken;
    return ret;
  }
});
usuarioSchema.set("toObject", { virtuals: true });

export default mongoose.model("Usuario", usuarioSchema);
