// src/routes/usuarioRoutes.js
import express from "express";
import { verificarToken, verificarRol, verificarPermiso } from "../middlewares/auth.js";
import * as usuarioController from "../controllers/usuarioController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get("/", verificarPermiso("gestionarUsuarios"), usuarioController.listar);
router.post("/", verificarRol("admin"), usuarioController.crear);
router.put("/:id", verificarRol("admin"), usuarioController.actualizar);
router.delete("/:id", verificarRol("admin"), usuarioController.eliminar);

export default router;
