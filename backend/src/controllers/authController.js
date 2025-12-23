// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Financiera from "../models/Financiera.js";
import Usuario from "../models/Usuario.js";

/**
 * Registro de nueva financiera + usuario admin
 */
export const registro = async (req, res) => {
  try {
    const { 
      nombreFinanciera,
      emailFinanciera,
      telefonoFinanciera,
      nombre,
      apellido,
      email,
      password 
    } = req.body;

    if (!nombreFinanciera || !email || !password || !nombre || !apellido) {
      return res.status(400).json({ 
        msg: "Todos los campos son requeridos" 
      });
    }

    const financieraExiste = await Financiera.findOne({ 
      email: emailFinanciera || email 
    });
    if (financieraExiste) {
      return res.status(400).json({ 
        msg: "Ya existe una cuenta con ese email" 
      });
    }

    const financiera = new Financiera({
      nombre: nombreFinanciera,
      email: emailFinanciera || email,
      telefono: telefonoFinanciera,
      configuracion: {
        tasasInteres: [
          { nombre: "Tasa Estándar", porcentaje: 5, tipo: "mensual" },
          { nombre: "Tasa Preferencial", porcentaje: 3, tipo: "mensual" },
        ],
        mora: {
          habilitada: true,
          porcentajeDiario: 0.5,
          diasGracia: 3
        },
        frecuenciasPago: ["mensual", "quincenal"]
      }
    });
    await financiera.save();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const usuario = new Usuario({
      financiera: financiera._id,
      nombre,
      apellido,
      email,
      password: passwordHash,
      rol: "admin",
      emailVerificado: true,
      permisos: {
        crearPrestamos: true,
        editarPrestamos: true,
        eliminarPrestamos: true,
        registrarPagos: true,
        verReportes: true,
        gestionarClientes: true,
        gestionarUsuarios: true,
        configurarSistema: true
      }
    });
    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, financiera: financiera._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" }
    );

    res.status(201).json({
      msg: "Registro exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        nombreCompleto: usuario.nombreCompleto
      },
      financiera: {
        id: financiera._id,
        nombre: financiera.nombre,
        plan: financiera.plan
      }
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ msg: "Error al registrar", error: error.message });
  }
};

/**
 * Inicio de sesión
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        msg: "Email y contraseña son requeridos" 
      });
    }

    const usuario = await Usuario.findOne({ email })
      .populate("financiera", "nombre estado plan logo colorPrimario");

    if (!usuario) {
      return res.status(401).json({ 
        msg: "Credenciales inválidas" 
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ 
        msg: "Credenciales inválidas" 
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({ 
        msg: "Usuario desactivado. Contacte al administrador." 
      });
    }

    if (usuario.financiera?.estado !== "activa") {
      return res.status(403).json({ 
        msg: "La cuenta de la financiera está suspendida" 
      });
    }

    usuario.ultimoAcceso = new Date();
    await usuario.save();

    const accessToken = jwt.sign(
      { id: usuario._id, financiera: usuario.financiera._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" }
    );

    const refreshToken = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "30d" }
    );

    usuario.refreshToken = refreshToken;
    await usuario.save();

    res.json({
      msg: "Login exitoso",
      accessToken,
      refreshToken,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        nombreCompleto: usuario.nombreCompleto,
        imagen: usuario.imagen,
        permisos: usuario.permisos
      },
      financiera: {
        id: usuario.financiera._id,
        nombre: usuario.financiera.nombre,
        plan: usuario.financiera.plan,
        logo: usuario.financiera.logo,
        colorPrimario: usuario.financiera.colorPrimario
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
};

/**
 * Renovar token de acceso
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ msg: "Refresh token requerido" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id)
      .populate("financiera", "nombre estado");

    if (!usuario || usuario.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: "Token inválido" });
    }

    if (!usuario.activo || usuario.financiera?.estado !== "activa") {
      return res.status(403).json({ msg: "Cuenta desactivada" });
    }

    const accessToken = jwt.sign(
      { id: usuario._id, financiera: usuario.financiera._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" }
    );

    res.json({ accessToken });

  } catch (error) {
    console.error("Error en refresh:", error);
    res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (req, res) => {
  try {
    req.usuario.refreshToken = null;
    await req.usuario.save();

    res.json({ msg: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ msg: "Error al cerrar sesión" });
  }
};

/**
 * Obtener usuario actual
 */
export const getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id)
      .select("-password -refreshToken")
      .populate("financiera", "nombre estado plan logo colorPrimario configuracion");

    res.json({ usuario });
  } catch (error) {
    console.error("Error en me:", error);
    res.status(500).json({ msg: "Error al obtener usuario" });
  }
};

/**
 * Cambiar contraseña
 */
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ 
        msg: "Contraseña actual y nueva son requeridas" 
      });
    }

    if (passwordNuevo.length < 6) {
      return res.status(400).json({ 
        msg: "La nueva contraseña debe tener al menos 6 caracteres" 
      });
    }

    const usuario = await Usuario.findById(req.usuario._id);
    const passwordValido = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValido) {
      return res.status(400).json({ 
        msg: "Contraseña actual incorrecta" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(passwordNuevo, salt);
    await usuario.save();

    res.json({ msg: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("Error al cambiar password:", error);
    res.status(500).json({ msg: "Error al cambiar contraseña" });
  }
};
