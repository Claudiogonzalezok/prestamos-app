// src/models/Cliente.js
import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  // Relación con financiera (tenant)
  financiera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Financiera",
    required: true
  },
  
  // Datos personales
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
  dni: {
    type: String,
    required: [true, "El DNI es requerido"],
    trim: true
  },
  cuil: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date
  },
  genero: {
    type: String,
    enum: ["masculino", "femenino", "otro", "no_especifica"],
    default: "no_especifica"
  },
  estadoCivil: {
    type: String,
    enum: ["soltero", "casado", "divorciado", "viudo", "union_libre"],
    default: "soltero"
  },
  
  // Contacto
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  celular: {
    type: String,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  
  // Dirección
  direccion: {
    calle: String,
    numero: String,
    piso: String,
    departamento: String,
    barrio: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String
  },
  
  // Datos laborales
  ocupacion: {
    type: String,
    trim: true
  },
  empleador: {
    type: String,
    trim: true
  },
  ingresoMensual: {
    type: Number,
    default: 0
  },
  antiguedadLaboral: {
    type: Number,  // en meses
    default: 0
  },
  
  // Referencia/Garante
  referencias: [{
    nombre: String,
    apellido: String,
    telefono: String,
    relacion: String  // "familiar", "amigo", "laboral"
  }],
  
  // Documentos adjuntos
  documentos: [{
    tipo: {
      type: String,
      enum: ["dni_frente", "dni_dorso", "recibo_sueldo", "servicio", "otro"]
    },
    nombre: String,
    url: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Acceso al portal de clientes
  acceso: {
    habilitado: {
      type: Boolean,
      default: false
    },
    password: String,
    ultimoAcceso: Date
  },
  
  // Scoring/Calificación interna
  calificacion: {
    type: String,
    enum: ["A", "B", "C", "D", "E"],  // A=excelente, E=malo
    default: "C"
  },
  notas: {
    type: String,
    trim: true
  },
  
  // Estado
  estado: {
    type: String,
    enum: ["activo", "inactivo", "bloqueado"],
    default: "activo"
  },
  
  // Imagen
  imagen: {
    type: String,
    default: null
  },
  
  // Quién lo registró
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  }
}, {
  timestamps: true
});

// Índices
clienteSchema.index({ financiera: 1, dni: 1 }, { unique: true });
clienteSchema.index({ financiera: 1, email: 1 });
clienteSchema.index({ financiera: 1, estado: 1 });
clienteSchema.index({ financiera: 1, apellido: 1, nombre: 1 });

// Virtual: nombre completo
clienteSchema.virtual("nombreCompleto").get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Virtual: iniciales
clienteSchema.virtual("iniciales").get(function() {
  return `${this.nombre[0]}${this.apellido[0]}`.toUpperCase();
});

// Virtual: edad
clienteSchema.virtual("edad").get(function() {
  if (!this.fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
});

// Virtual: teléfono de contacto preferido
clienteSchema.virtual("telefonoContacto").get(function() {
  return this.whatsapp || this.celular || this.telefono || null;
});

clienteSchema.set("toJSON", { virtuals: true });
clienteSchema.set("toObject", { virtuals: true });

export default mongoose.model("Cliente", clienteSchema);
