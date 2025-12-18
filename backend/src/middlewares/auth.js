// src/middlewares/auth.js
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

/**
 * Middleware para verificar token JWT
 */
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        msg: "Acceso denegado. Token no proporcionado." 
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario y verificar que esté activo
      const usuario = await Usuario.findById(decoded.id)
        .populate("financiera", "nombre estado plan");
      
      if (!usuario) {
        return res.status(401).json({ 
          msg: "Token inválido. Usuario no encontrado." 
        });
      }
      
      if (!usuario.activo) {
        return res.status(401).json({ 
          msg: "Usuario desactivado. Contacte al administrador." 
        });
      }
      
      // Verificar que la financiera esté activa
      if (usuario.financiera?.estado !== "activa") {
        return res.status(403).json({ 
          msg: "La cuenta de la financiera está suspendida." 
        });
      }
      
      // Agregar usuario y financiera al request
      req.usuario = usuario;
      req.financieraId = usuario.financiera._id;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          msg: "Token expirado. Por favor inicie sesión nuevamente." 
        });
      }
      return res.status(401).json({ 
        msg: "Token inválido." 
      });
    }
  } catch (error) {
    console.error("Error en verificarToken:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * Middleware para verificar rol
 * @param  {...string} rolesPermitidos - Roles que pueden acceder
 */
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        msg: "No autenticado" 
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        msg: "No tiene permisos para realizar esta acción" 
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar permiso específico
 * @param {string} permiso - Nombre del permiso requerido
 */
export const verificarPermiso = (permiso) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        msg: "No autenticado" 
      });
    }
    
    // Admin tiene todos los permisos
    if (req.usuario.rol === "admin") {
      return next();
    }
    
    // Verificar permiso específico
    if (!req.usuario.permisos[permiso]) {
      return res.status(403).json({ 
        msg: `No tiene permiso para: ${permiso}` 
      });
    }
    
    next();
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const autenticacionOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findById(decoded.id)
        .populate("financiera", "nombre estado");
      
      if (usuario && usuario.activo) {
        req.usuario = usuario;
        req.financieraId = usuario.financiera._id;
      }
    } catch (jwtError) {
      // Ignorar errores de JWT en autenticación opcional
    }
    
    next();
  } catch (error) {
    next();
  }
};
