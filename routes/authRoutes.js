// routes/auth.routes.js
import express from "express";
import { register, login, profile, updateProfile, changePassword, forgotPassword, resetPassword, getDeliveryAddress } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// -------------------- PUBLIC ROUTES --------------------
router.post("/register", register);
router.post("/login", login);

// -------------------- PROTECTED ROUTES --------------------
// All routes below require valid JWT
router.get("/profile", authenticate, profile);
router.put("/update-profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/delivery-address", getDeliveryAddress);
export default router;
