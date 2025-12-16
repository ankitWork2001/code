import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../controllers/serviceController.js";

import { authenticate, isAdmin, isSuperAdmin } from "../middlewares/authMiddleware.js";

import express from "express";
const router = express.Router();

router.post("/create-service", authenticate, isSuperAdmin, createService);
router.get("/get-services", getAllServices);
router.get("/get-service/:id", getServiceById);
router.put("/update-service/:id", authenticate, isSuperAdmin, updateService);
router.delete("/delete-service/:id", authenticate, isSuperAdmin, deleteService);
router.patch("/toggle-status/:id", authenticate, isAdmin, toggleServiceStatus);

export default router;
