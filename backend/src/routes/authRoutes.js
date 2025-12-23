// src/routes/authRoutes.js
import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Rutas públicas
router.post("/registro", authController.registro);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Rutas protegidas
router.post("/logout", verificarToken, authController.logout);
router.get("/me", verificarToken, authController.getMe);
router.put("/cambiar-password", verificarToken, authController.cambiarPassword);

export default router;
