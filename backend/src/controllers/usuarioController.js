// src/controllers/usuarioController.js
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

/**
 * Listar usuarios de la financiera
 */
export const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.find({ financiera: req.financieraId })
      .select("-password -refreshToken")
      .sort({ rol: 1, nombre: 1 });
    
    res.json({ usuarios });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
};

/**
 * Crear nuevo usuario (empleado)
 */
export const crear = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, permisos, telefono } = req.body;
    
    const existe = await Usuario.findOne({ financiera: req.financieraId, email });
    if (existe) {
      return res.status(400).json({ msg: "Ya existe un usuario con ese email" });
    }
    
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
};

/**
 * Actualizar usuario
 */
export const actualizar = async (req, res) => {
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
};

/**
 * Desactivar usuario
 */
export const eliminar = async (req, res) => {
  try {
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
};
