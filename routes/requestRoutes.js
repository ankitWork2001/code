import express from "express";

import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-request", authenticate, createRequest);
router.get("/get-requests", authenticate, isAdmin, getAllRequests);
router.get("/get-my-requests", authenticate, getRequestById);
router.put("/update-request-status/:requestId", authenticate, isAdmin, updateRequestStatus);

export default router;
