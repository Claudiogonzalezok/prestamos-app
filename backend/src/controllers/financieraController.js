// src/controllers/financieraController.js
import Financiera from "../models/Financiera.js";

/**
 * Obtener datos de la financiera actual
 */
export const obtenerMiFinanciera = async (req, res) => {
  try {
    const financiera = await Financiera.findById(req.financieraId);
    
    if (!financiera) {
      return res.status(404).json({ msg: "Financiera no encontrada" });
    }
    
    res.json({ financiera });
  } catch (error) {
    console.error("Error al obtener financiera:", error);
    res.status(500).json({ msg: "Error al obtener financiera" });
  }
};

/**
 * Actualizar datos de la financiera
 */
export const actualizar = async (req, res) => {
  try {
    const camposPermitidos = [
      "nombre", "razonSocial", "cuit", "telefono", "whatsapp",
      "direccion", "configuracion", "logo", "colorPrimario"
    ];
    
    const actualizacion = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        actualizacion[campo] = req.body[campo];
      }
    });
    
    const financiera = await Financiera.findByIdAndUpdate(
      req.financieraId,
      actualizacion,
      { new: true, runValidators: true }
    );
    
    res.json({ msg: "Financiera actualizada", financiera });
  } catch (error) {
    console.error("Error al actualizar financiera:", error);
    res.status(500).json({ msg: "Error al actualizar financiera" });
  }
};

/**
 * Actualizar configuración de préstamos
 */
export const actualizarConfiguracion = async (req, res) => {
  try {
    const { 
      tasasInteres, 
      mora, 
      cancelacionAnticipada, 
      frecuenciasPago, 
      montoMinimo, 
      montoMaximo, 
      plazoMinimo, 
      plazoMaximo 
    } = req.body;
    
    const financiera = await Financiera.findById(req.financieraId);
    
    if (tasasInteres) financiera.configuracion.tasasInteres = tasasInteres;
    if (mora) financiera.configuracion.mora = mora;
    if (cancelacionAnticipada) financiera.configuracion.cancelacionAnticipada = cancelacionAnticipada;
    if (frecuenciasPago) financiera.configuracion.frecuenciasPago = frecuenciasPago;
    if (montoMinimo) financiera.configuracion.montoMinimo = montoMinimo;
    if (montoMaximo) financiera.configuracion.montoMaximo = montoMaximo;
    if (plazoMinimo) financiera.configuracion.plazoMinimo = plazoMinimo;
    if (plazoMaximo) financiera.configuracion.plazoMaximo = plazoMaximo;
    
    await financiera.save();
    
    res.json({ msg: "Configuración actualizada", configuracion: financiera.configuracion });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ msg: "Error al actualizar configuración" });
  }
};
