import express from "express";
import { bookAirTicket, getAllAirBookings, getAirBookingById, getMyBookings, getAirports, changeStatus } from "../controllers/airBookingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/book", authenticate, bookAirTicket);
router.get("/all-air-bookings", authenticate, getAllAirBookings);
// router.get("/:id", authenticate, getAirBookingById);

router.get("/my-bookings", authenticate, getMyBookings);

router.put("/change-status/:id", authenticate, changeStatus);

router.get("/airports", getAirports);
export default router;
