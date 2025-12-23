// src/routes/portalClienteRoutes.js
import express from "express";
import { verificarTokenCliente } from "../middlewares/authCliente.js";
import * as portalController from "../controllers/portalClienteController.js";

const router = express.Router();

// Ruta pública
router.post("/login", portalController.login);

// Rutas protegidas (requieren token de cliente)
router.use(verificarTokenCliente);

router.get("/mi-perfil", portalController.miPerfil);
router.get("/mis-prestamos", portalController.misPrestamos);
router.get("/mis-prestamos/:id", portalController.detallePrestamo);
router.get("/mis-cuotas", portalController.misCuotas);
router.get("/mis-pagos", portalController.misPagos);
router.put("/cambiar-password", portalController.cambiarPassword);

export default router;
