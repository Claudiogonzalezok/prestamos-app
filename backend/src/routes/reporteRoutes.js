// src/routes/reporteRoutes.js
import express from "express";
import { verificarToken, verificarPermiso } from "../middlewares/auth.js";
import * as reporteController from "../controllers/reporteController.js";

const router = express.Router();

// Todas las rutas requieren autenticación y permiso de reportes
router.use(verificarToken);
router.use(verificarPermiso("verReportes"));

router.get("/dashboard", reporteController.dashboard);
router.get("/cartera", reporteController.cartera);
router.get("/cobranza", reporteController.cobranza);
router.get("/morosidad", reporteController.morosidad);

export default router;
