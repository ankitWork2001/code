import express from "express";

import {
  createRequest,
  getAllRequests,
  getRequestById,
} from "../controllers/requestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-request", authenticate, createRequest);
router.get("/get-requests", authenticate, getAllRequests);
router.get("/get-request/:id", authenticate, getRequestById);

export default router;
