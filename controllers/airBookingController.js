import AirBooking from "../models/AirBooking.js";
import { airports } from "../data/airports.js";
// ------------------------- CREATE AirBooking -------------------------
// Validate passenger fields
const validateAdultPassengers = (passengers) => {
  if (!passengers?.Adult || passengers.Adult.length === 0) {
    return "At least one adult passenger is required";
  }

  for (const adult of passengers.Adult) {
    if (!adult.name) {
      return "Adult passenger name is required";
    }

    if (!adult.age) {
      return "Adult passenger age is required";
    }
    if(!adult.phone){
      return "Adult passenger phone is required";
    }
  }

  return null;
};


export const bookAirTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromCity, toCity, departureDate, travelClass, travelType, returnDate, passengers } = req.body;

    if(!fromCity || !toCity || !departureDate || !travelClass || !travelType){
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if(travelType === "RoundTrip" && !returnDate){
      return res.status(400).json({ success: false, message: "Return date is required for round-trip bookings" });
    }

    const passengerError = validateAdultPassengers(passengers);
    if (passengerError) {
      return res.status(400).json({ success: false, message: passengerError });
    }

    const newAirBooking = await AirBooking.create({
      userId,
      fromCity,
      toCity,
      departureDate,
      travelClass,
      passengers,
      travelType,
      returnDate
    });

    res.status(201).json({
      success: true,
      message: "Air ticket booked successfully",
      data: newAirBooking
    });
  } catch (error) {
    console.error("AirBooking Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ------------------------- GET ALL AirBookingS -------------------------
export const getAllAirBookings = async (req, res) => {
  try {
    const airBookings = await AirBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: airBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------- GET SINGLE AirBooking -------------------------
export const getAirBookingById = async (req, res) => {
  try {
    const airBooking = await AirBooking.findById(req.params.id);
    if (!airBooking)
      return res.status(404).json({ success: false, message: "AirBooking not found" });

    res.status(200).json({ success: true, data: airBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await AirBooking.find({ userId }).sort({ createdAt: -1 });
    console.log("Fetched My Bookings:", bookings);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["Pending", "Booked", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const updatedBooking = await AirBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, message: "Status updated successfully", data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAirports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: airports.length,
      data: airports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch airports",
    });
  }
};

