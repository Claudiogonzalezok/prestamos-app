// src/routes/financieraRoutes.js
import express from "express";
import { verificarToken, verificarRol } from "../middlewares/auth.js";
import * as financieraController from "../controllers/financieraController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get("/mi-financiera", financieraController.obtenerMiFinanciera);
router.put("/mi-financiera", verificarRol("admin"), financieraController.actualizar);
router.put("/configuracion", verificarRol("admin"), financieraController.actualizarConfiguracion);

export default router;
