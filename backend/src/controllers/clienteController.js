// src/controllers/clienteController.js
import Cliente from "../models/Cliente.js";

/**
 * Listar clientes de la financiera
 */
export const listar = async (req, res) => {
  try {
    const { estado, buscar, calificacion, page = 1, limit = 20 } = req.query;
    
    const filtro = { financiera: req.financieraId };
    
    if (estado) filtro.estado = estado;
    if (calificacion) filtro.calificacion = calificacion;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { apellido: { $regex: buscar, $options: "i" } },
        { dni: { $regex: buscar, $options: "i" } },
        { email: { $regex: buscar, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [clientes, total] = await Promise.all([
      Cliente.find(filtro)
        .sort({ apellido: 1, nombre: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-acceso.password"),
      Cliente.countDocuments(filtro)
    ]);
    
    res.json({
      clientes,
      paginacion: {
        total,
        pagina: parseInt(page),
        limite: parseInt(limit),
        paginas: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(500).json({ msg: "Error al obtener clientes" });
  }
};

/**
 * Obtener cliente por ID
 */
export const obtenerPorId = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      financiera: req.financieraId
    }).select("-acceso.password");
    
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }
    
    res.json({ cliente });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ msg: "Error al obtener cliente" });
  }
};

/**
 * Crear nuevo cliente
 */
export const crear = async (req, res) => {
  try {
    const cliente = new Cliente({
      ...req.body,
      financiera: req.financieraId,
      creadoPor: req.usuario._id
    });
    
    await cliente.save();
    
    res.status(201).json({ 
      msg: "Cliente creado exitosamente", 
      cliente 
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Ya existe un cliente con ese DNI" });
    }
    res.status(500).json({ msg: "Error al crear cliente", error: error.message });
  }
};

/**
 * Actualizar cliente
 */
export const actualizar = async (req, res) => {
  try {
    delete req.body.financiera;
    
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, financiera: req.financieraId },
      req.body,
      { new: true, runValidators: true }
    ).select("-acceso.password");
    
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }
    
    res.json({ msg: "Cliente actualizado", cliente });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ msg: "Error al actualizar cliente" });
  }
};

/**
 * Eliminar cliente (soft delete)
 */
export const eliminar = async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, financiera: req.financieraId },
      { estado: "inactivo" },
      { new: true }
    );
    
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }
    
    res.json({ msg: "Cliente desactivado" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ msg: "Error al eliminar cliente" });
  }
};
