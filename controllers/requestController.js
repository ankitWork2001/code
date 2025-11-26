import Request from "../models/Request.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

// --------------------------------------------------
// CREATE NEW REQUEST
// --------------------------------------------------
export const createRequest = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { serviceId, formData, documents } = req.body;

    // Validate service
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const request = new Request({
      user: userId,
      service: serviceId,
      formData: formData || {},
      documents: documents || [],
      status: "pending", // from draft to pending
      history: [
        {
          fromStatus: "draft",
          toStatus: "pending",
          changedBy: userId,
          comment: "Request created",
        },
      ],
    });

    await request.save();

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// GET REQUEST BY ID (Access only your own request)
// --------------------------------------------------
export const getRequestById = async (req, res) => {
  try {
    const userId = req.userId; // logged-in user

    const request = await Request.findOne({
      user: userId,
    })
      .populate("user", "name email")
      .populate("service", "name description")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No request found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Request By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// GET ALL REQUESTS (ADMIN ONLY)
// --------------------------------------------------
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("user", "firstName lastName email phone")
      .populate("service", "name description")
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
