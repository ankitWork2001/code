import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../controllers/serviceController.js";

import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

import express from "express";
const router = express.Router();

router.post("/create-service", authenticate, isAdmin, createService);
router.get("/get-services", getAllServices);
router.get("/get-service/:id", getServiceById);
router.put("/update-service/:id", authenticate, isAdmin, updateService);
router.delete("/delete-service/:id", authenticate, isAdmin, deleteService);
router.patch("/toggle-status/:id", authenticate, isAdmin, toggleServiceStatus);

export default router;
