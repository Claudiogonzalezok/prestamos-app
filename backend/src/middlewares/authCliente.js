// src/middlewares/authCliente.js
import jwt from "jsonwebtoken";
import Cliente from "../models/Cliente.js";

/**
 * Middleware para verificar token de cliente (portal)
 */
export const verificarTokenCliente = async (req, res, next) => {
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
      
      // Verificar que sea un token de cliente
      if (decoded.tipo !== "cliente") {
        return res.status(401).json({ 
          msg: "Token inválido para este recurso." 
        });
      }
      
      // Buscar cliente
      const cliente = await Cliente.findById(decoded.id)
        .populate("financiera", "nombre estado configuracion");
      
      if (!cliente) {
        return res.status(401).json({ 
          msg: "Cliente no encontrado." 
        });
      }
      
      if (cliente.estado !== "activo") {
        return res.status(401).json({ 
          msg: "Su cuenta está inactiva. Contacte a la financiera." 
        });
      }
      
      if (!cliente.acceso.habilitado) {
        return res.status(401).json({ 
          msg: "Su acceso al portal no está habilitado." 
        });
      }
      
      // Verificar que la financiera esté activa
      if (cliente.financiera?.estado !== "activa") {
        return res.status(403).json({ 
          msg: "La financiera no está disponible en este momento." 
        });
      }
      
      // Agregar cliente y financiera al request
      req.cliente = cliente;
      req.financieraId = cliente.financiera._id;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          msg: "Sesión expirada. Por favor inicie sesión nuevamente." 
        });
      }
      return res.status(401).json({ 
        msg: "Token inválido." 
      });
    }
  } catch (error) {
    console.error("Error en verificarTokenCliente:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
