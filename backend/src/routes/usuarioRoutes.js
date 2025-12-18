// src/routes/usuarioRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import { verificarToken, verificarRol, verificarPermiso } from "../middlewares/auth.js";

const router = express.Router();

router.use(verificarToken);

/**
 * GET /api/usuarios
 * Listar usuarios de la financiera
 */
router.get("/", verificarPermiso("gestionarUsuarios"), async (req, res) => {
  try {
    const usuarios = await Usuario.find({ financiera: req.financieraId })
      .select("-password -refreshToken")
      .sort({ rol: 1, nombre: 1 });
    
    res.json({ usuarios });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
});

/**
 * POST /api/usuarios
 * Crear nuevo usuario (empleado)
 */
router.post("/", verificarRol("admin"), async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, permisos, telefono } = req.body;
    
    // Verificar si ya existe
    const existe = await Usuario.findOne({ financiera: req.financieraId, email });
    if (existe) {
      return res.status(400).json({ msg: "Ya existe un usuario con ese email" });
    }
    
    // Hashear password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const usuario = new Usuario({
      financiera: req.financieraId,
      nombre,
      apellido,
      email,
      password: passwordHash,
      rol: rol || "empleado",
      permisos,
      telefono,
      emailVerificado: true
    });
    
    await usuario.save();
    
    res.status(201).json({ 
      msg: "Usuario creado", 
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ msg: "Error al crear usuario" });
  }
});

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario
 */
router.put("/:id", verificarRol("admin"), async (req, res) => {
  try {
    const { nombre, apellido, telefono, rol, permisos, activo } = req.body;
    
    const usuario = await Usuario.findOneAndUpdate(
      { _id: req.params.id, financiera: req.financieraId },
      { nombre, apellido, telefono, rol, permisos, activo },
      { new: true }
    ).select("-password -refreshToken");
    
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    
    res.json({ msg: "Usuario actualizado", usuario });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ msg: "Error al actualizar usuario" });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Desactivar usuario
 */
router.delete("/:id", verificarRol("admin"), async (req, res) => {
  try {
    // No permitir eliminarse a sí mismo
    if (req.params.id === req.usuario._id.toString()) {
      return res.status(400).json({ msg: "No puede desactivarse a sí mismo" });
    }
    
    const usuario = await Usuario.findOneAndUpdate(
      { _id: req.params.id, financiera: req.financieraId },
      { activo: false },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    
    res.json({ msg: "Usuario desactivado" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({ msg: "Error al desactivar usuario" });
  }
});

export default router;
