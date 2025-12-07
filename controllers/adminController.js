import User from "../models/User.js";
import Service from "../models/Service.js";
import Request from "../models/Request.js";

export const countServices = async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    const pendingRequests = await Request.countDocuments({ status: "pending" });
    const completedRequests = await Request.countDocuments({ status: "completed" });
    res.status(200).json({
      success: true,
      data: {
        totalServices,
        activeServices,
        pendingRequests,
        completedRequests,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async(req, res) => {
  try {
    const users = await User.find({role: "user"}).select("-password -passwordResetOTP -passwordResetOTPExpires").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}