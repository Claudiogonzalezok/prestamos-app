// src/routes/pagoRoutes.js
import express from "express";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";
import * as pagoController from "../controllers/pagoController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get("/", pagoController.listar);
router.get("/resumen/hoy", pagoController.resumenHoy);
router.get("/:id", pagoController.obtenerPorId);
router.post("/", verificarPermiso("registrarPagos"), pagoController.registrar);
router.put("/:id/anular", verificarPermiso("editarPrestamos"), pagoController.anular);

export default router;
