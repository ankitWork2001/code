import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { countServices } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", authenticate, countServices);

export default router;