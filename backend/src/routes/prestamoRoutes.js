// src/routes/prestamoRoutes.js
import express from "express";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";
import * as prestamoController from "../controllers/prestamoController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post("/simular", prestamoController.simular);
router.get("/", prestamoController.listar);
router.get("/:id", prestamoController.obtenerPorId);
router.post("/", verificarPermiso("crearPrestamos"), prestamoController.crear);
router.get("/:id/cancelacion-anticipada", prestamoController.calcularCancelacion);
router.put("/:id/estado", verificarPermiso("editarPrestamos"), prestamoController.cambiarEstado);

export default router;
