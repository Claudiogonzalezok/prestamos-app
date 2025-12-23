// src/routes/cuotaRoutes.js
import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import * as cuotaController from "../controllers/cuotaController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get("/", cuotaController.listar);
router.get("/proximas-vencer", cuotaController.proximasVencer);
router.get("/vencidas", cuotaController.vencidas);
router.get("/:id", cuotaController.obtenerPorId);
router.put("/:id/actualizar-mora", cuotaController.actualizarMora);

export default router;
