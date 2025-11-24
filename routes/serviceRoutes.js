import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../controllers/serviceController.js";

import express from "express";
const router = express.Router();

router.post("/create-service", createService);
router.get("/get-services", getAllServices);
router.get("/get-service/:id", getServiceById);
router.put("/update-service/:id", updateService);
router.delete("/delete-service/:id", deleteService);
router.patch("/toggle-status/:id", toggleServiceStatus);

export default router;
