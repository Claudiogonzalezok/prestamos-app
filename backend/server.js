// server.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";

// Importar rutas
import authRoutes from "./src/routes/authRoutes.js";
import financieraRoutes from "./src/routes/financieraRoutes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import clienteRoutes from "./src/routes/clienteRoutes.js";
import prestamoRoutes from "./src/routes/prestamoRoutes.js";
import cuotaRoutes from "./src/routes/cuotaRoutes.js";
import pagoRoutes from "./src/routes/pagoRoutes.js";
import reporteRoutes from "./src/routes/reporteRoutes.js";
import portalClienteRoutes from "./src/routes/portalClienteRoutes.js";

const app = express();

// ============================================
// CONFIGURACIÓN DE DIRECTORIOS
// ============================================
const uploadsPath = path.join(__dirname, "uploads");
const subdirs = ["documentos", "comprobantes", "perfiles", "logos"];

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Directorio de uploads creado: ${uploadsPath}`);
}

subdirs.forEach((subdir) => {
  const fullPath = path.join(uploadsPath, subdir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Subdirectorio creado: ${fullPath}`);
  }
});

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (mobile, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.some((allowed) => origin.startsWith(allowed.replace(/\/$/, "")))) {
        callback(null, true);
      } else if (origin.includes("vercel.app") || origin.includes("render.com")) {
        callback(null, true);
      } else {
        console.log(`⚠️ CORS - Origin no permitido: ${origin}`);
        callback(null, true); // En desarrollo permitimos todo
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ============================================
// MIDDLEWARES
// ============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir archivos estáticos
app.use("/uploads", express.static(uploadsPath));

// Logger de requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// CONEXIÓN A MONGODB
// ============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
  })
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  });

// ============================================
// RUTAS API
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/financieras", financieraRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/prestamos", prestamoRoutes);
app.use("/api/cuotas", cuotaRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/portal", portalClienteRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    nombre: "CreditosPro API",
    version: "1.0.0",
    descripcion: "Sistema de gestión de préstamos personales",
    ambiente: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
// Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({ msg: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      msg: "Error de validación",
      errores: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Error de duplicado
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      msg: `Ya existe un registro con ese ${campo}`,
    });
  }

  // Error de Cast (ID inválido)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      msg: "ID inválido",
    });
  }

  res.status(err.status || 500).json({
    msg: err.message || "Error del servidor",
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`💰 CREDITOSPRO - API`);
  console.log(`${"=".repeat(50)}`);
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Uploads: ${uploadsPath}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "No configurado"}`);
  console.log(`${"=".repeat(50)}\n`);
});

// ============================================
// MANEJO DE CIERRE
// ============================================
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ ${signal} recibido. Cerrando servidor...`);
  mongoose.connection.close(false, () => {
    console.log("✅ Conexión a MongoDB cerrada");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

export default app;
