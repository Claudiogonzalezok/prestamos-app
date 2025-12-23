// src/routes/clienteRoutes.js
import express from "express";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";
import * as clienteController from "../controllers/clienteController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get("/", clienteController.listar);
router.get("/:id", clienteController.obtenerPorId);
router.post("/", verificarPermiso("gestionarClientes"), clienteController.crear);
router.put("/:id", verificarPermiso("gestionarClientes"), clienteController.actualizar);
router.delete("/:id", verificarPermiso("gestionarClientes"), clienteController.eliminar);

export default router;
