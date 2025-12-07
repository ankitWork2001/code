import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { countServices, getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", authenticate, countServices);
router.get("/users", authenticate, getAllUsers);

export default router;