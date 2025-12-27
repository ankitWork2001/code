import Request from "../models/Request.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { createNotification } from "../utils/createNotification.js";

// --------------------------------------------------
// CREATE NEW REQUEST
// --------------------------------------------------

const SPECIAL_SERVICES_IDS = [
  "694d432660f4c07b01a26022",
  "694e1d5160f4c07b01a262ca",
];

export const createRequest = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { serviceId, subServiceId, subServiceName, formData, documents } = req.body;
    console.log("Create Request Body:", req.body);

    // const existingRequest = await Request.findOne({
    //   user: userId,
    //   service: serviceId,
    //   subService: subServiceId,
    //   status: { $in: ["pending", "processing"] },
    // });

    // if (existingRequest) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You already applied for this service.",
    //   });
    // }

    // Validate service
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

       const subService = serviceExists.subServices.id(subServiceId);
if (!subService) {
  return res.status(404).json({
    success: false,
    message: "Selected sub-service not found",
  });
}

    const request = new Request({
      user: userId,
      service: serviceId,
      subService: subServiceId,
      subServiceName: subService.name,
      formData: formData || {},
      documents: documents || [],
    });

    await request.save();

    await createNotification(
          userId,
          "Request Created",
          "success",
          `Your request for ${serviceExists.name} has been created successfully.`
        );

        console.log("Created Request:", request);

   if (SPECIAL_SERVICES_IDS.includes(serviceId)) {
  return res.status(201).json({
    success: true,
    message: `Request created succefully.`,
    action: "SEND_DOCUMENTS_EXTERNALLY",
    address: process.env.MY_ADDRESS,
    data: request,
  });
}

    // ✅ Normal response for other services
    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: request,
    });

  } catch (error) {
    console.log("Create Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// GET REQUEST BY ID (Access only your own request)
// --------------------------------------------------
export const getRequestById = async (req, res) => {
  try {
    const userId = req.userId; // logged-in user

    const requests = await Request.find({
      user: userId,
    }).populate("service", "name description").sort({ createdAt: -1 })
      .lean();

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending requests found",
      });
    }

    console.log("Fetched Requests:", requests);

    return res.status(200).json({
      success: true,
      data: requests,
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
      .populate("service", "name description").sort({ createdAt: -1 })
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


export const updateRequestStatus = async (req, res) => {
  console.log(req.body);
  try {
    const { requestId } = req.params;
    const { newStatus, rejectedReason, outputs } = req.body;
    const adminId = req.userId;

    // Validate status
    const validStatuses = ["pending", "processing", "completed", "rejected", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Update status
    request.status = newStatus;

    // If rejected, store reason
    if (newStatus === "rejected" && rejectedReason) {
      request.rejectedReason = rejectedReason;
    }

    if (newStatus === "completed") {
      request.completedAt = new Date();
      if (outputs && Array.isArray(outputs)) {
        request.outputs.push(...outputs.map(output => ({
          label: output.label,
          url: output.url,
          uploadedAt: new Date(),
          uploadedBy: adminId,
        })));
      }
    }

    await request.save();

    await createNotification(
           request.user,
          "Request Status Updated",
          "info",
          `Your request status has been updated to ${newStatus}.`
        );

    res.status(200).json({ message: "Request status updated successfully.", request });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
