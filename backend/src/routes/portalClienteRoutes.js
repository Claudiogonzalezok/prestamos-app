// src/routes/portalClienteRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cliente from "../models/Cliente.js";
import Prestamo from "../models/Prestamo.js";
import Cuota from "../models/Cuota.js";
import Pago from "../models/Pago.js";
import { verificarTokenCliente } from "../middlewares/authCliente.js";

const router = express.Router();

/**
 * POST /api/portal/login
 * Login de cliente al portal
 */
router.post("/login", async (req, res) => {
  try {
    const { dni, password } = req.body;
    
    if (!dni || !password) {
      return res.status(400).json({ msg: "DNI y contraseña son requeridos" });
    }
    
    // Buscar cliente por DNI
    const cliente = await Cliente.findOne({ dni })
      .populate("financiera", "nombre estado logo colorPrimario");
    
    if (!cliente) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }
    
    // Verificar que tenga acceso habilitado
    if (!cliente.acceso.habilitado) {
      return res.status(401).json({ msg: "Su acceso al portal no está habilitado" });
    }
    
    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, cliente.acceso.password);
    if (!passwordValido) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }
    
    // Verificar estado
    if (cliente.estado !== "activo") {
      return res.status(401).json({ msg: "Su cuenta está inactiva" });
    }
    
    // Verificar financiera activa
    if (cliente.financiera?.estado !== "activa") {
      return res.status(403).json({ msg: "El servicio no está disponible" });
    }
    
    // Actualizar último acceso
    cliente.acceso.ultimoAcceso = new Date();
    await cliente.save();
    
    // Generar token
    const token = jwt.sign(
      { id: cliente._id, tipo: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      msg: "Login exitoso",
      token,
      cliente: {
        id: cliente._id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        nombreCompleto: cliente.nombreCompleto
      },
      financiera: {
        nombre: cliente.financiera.nombre,
        logo: cliente.financiera.logo,
        colorPrimario: cliente.financiera.colorPrimario
      }
    });
    
  } catch (error) {
    console.error("Error en login cliente:", error);
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
});

// Rutas protegidas
router.use(verificarTokenCliente);

/**
 * GET /api/portal/mi-perfil
 * Obtener perfil del cliente
 */
router.get("/mi-perfil", async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.cliente._id)
      .select("-acceso.password -documentos");
    
    res.json({ cliente });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ msg: "Error al obtener perfil" });
  }
});

/**
 * GET /api/portal/mis-prestamos
 * Listar préstamos del cliente
 */
router.get("/mis-prestamos", async (req, res) => {
  try {
    const prestamos = await Prestamo.find({
      cliente: req.cliente._id,
      estado: { $in: ["activo", "atrasado", "finalizado"] }
    })
      .select("numeroPrestamo montoAprobado plazoMeses estado saldoTotal totalPagado porcentajePagado fechaDesembolso")
      .sort({ createdAt: -1 });
    
    res.json({ prestamos });
  } catch (error) {
    console.error("Error al listar préstamos:", error);
    res.status(500).json({ msg: "Error al obtener préstamos" });
  }
});

/**
 * GET /api/portal/mis-prestamos/:id
 * Detalle de un préstamo
 */
router.get("/mis-prestamos/:id", async (req, res) => {
  try {
    const prestamo = await Prestamo.findOne({
      _id: req.params.id,
      cliente: req.cliente._id
    });
    
    if (!prestamo) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }
    
    const cuotas = await Cuota.find({ prestamo: prestamo._id })
      .select("numeroCuota montoCuota fechaVencimiento estado saldoPendiente mora")
      .sort({ numeroCuota: 1 });
    
    res.json({ prestamo, cuotas });
  } catch (error) {
    console.error("Error al obtener préstamo:", error);
    res.status(500).json({ msg: "Error al obtener préstamo" });
  }
});

/**
 * GET /api/portal/mis-cuotas
 * Cuotas pendientes del cliente
 */
router.get("/mis-cuotas", async (req, res) => {
  try {
    const cuotas = await Cuota.find({
      cliente: req.cliente._id,
      estado: { $in: ["pendiente", "parcial", "vencida"] }
    })
      .populate("prestamo", "numeroPrestamo")
      .select("numeroCuota montoCuota fechaVencimiento estado saldoPendiente mora")
      .sort({ fechaVencimiento: 1 });
    
    res.json({ cuotas });
  } catch (error) {
    console.error("Error al listar cuotas:", error);
    res.status(500).json({ msg: "Error al obtener cuotas" });
  }
});

/**
 * GET /api/portal/mis-pagos
 * Historial de pagos del cliente
 */
router.get("/mis-pagos", async (req, res) => {
  try {
    const pagos = await Pago.find({
      cliente: req.cliente._id,
      estado: "confirmado"
    })
      .populate("prestamo", "numeroPrestamo")
      .select("numeroRecibo monto fechaPago metodoPago")
      .sort({ fechaPago: -1 })
      .limit(50);
    
    res.json({ pagos });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    res.status(500).json({ msg: "Error al obtener pagos" });
  }
});

/**
 * PUT /api/portal/cambiar-password
 * Cambiar contraseña del cliente
 */
router.put("/cambiar-password", async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;
    
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ msg: "Contraseñas requeridas" });
    }
    
    const cliente = await Cliente.findById(req.cliente._id);
    
    const passwordValido = await bcrypt.compare(passwordActual, cliente.acceso.password);
    if (!passwordValido) {
      return res.status(400).json({ msg: "Contraseña actual incorrecta" });
    }
    
    const salt = await bcrypt.genSalt(10);
    cliente.acceso.password = await bcrypt.hash(passwordNuevo, salt);
    await cliente.save();
    
    res.json({ msg: "Contraseña actualizada" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ msg: "Error al cambiar contraseña" });
  }
});

export default router;
