import Service from "../models/Service.js";
import { createNotification } from "../utils/createNotification.js";

// Create a new service
export const createService = async (req, res) => {
  console.log("Create Service Payload:", req.body);
  try {
    const userId = req.userId; // from auth middleware
    const {
      name,
      imageURL,
      description,
      requiredDocuments,
      estimatedProcessingDays,
      subServices,
      subServicesUIType,
      airlines,
    } = req.body;

    // Basic Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and Description are required",
      });
    }

    // Check duplicate
    const exists = await Service.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "A service with this name already exists",
      });
    }

    // Validate requiredDocuments
    if (requiredDocuments && !Array.isArray(requiredDocuments)) {
      return res.status(400).json({
        success: false,
        message: "requiredDocuments must be an array",
      });
    }

    // Validate estimatedProcessingDays
    if (
      estimatedProcessingDays &&
      (isNaN(estimatedProcessingDays) || estimatedProcessingDays < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "estimatedProcessingDays must be a positive number",
      });
    }

      if (airlines && !Array.isArray(airlines)) {
      return res.status(400).json({
        success: false,
        message: "airlines must be an array of strings",
      });
    }

      // Validate subServices
    if (subServices && !Array.isArray(subServices)) {
      return res.status(400).json({
        success: false,
        message: "subServices must be an array",
      });
    }

    const newService = new Service({
      name: name.trim(),
      imageURL: imageURL || "",
      description,
      requiredDocuments: requiredDocuments || [],
      estimatedProcessingDays: estimatedProcessingDays || 0,
      subServices: subServices || [],
      subServicesUIType: subServicesUIType || "card",
      airlines: airlines || [],
    });

    const savedService = await newService.save();

    await createNotification(
          userId,
          "Service Created",
          "info",
          "A new service has been created successfully."
        );

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: savedService,
    });
  } catch (error) {
    console.log("Create Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all active services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: services });
    console.log(services);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update service by ID
export const updateService = async (req, res) => {
  console.log("Update Service Payload:", req.body);
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete service by ID
export const deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: deletedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleServiceStatus = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    // Find service first
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    // Toggle status
    service.isActive = !service.isActive;

    // Save updated document
    await service.save();

    await createNotification(
          userId,
          "Service Status Changed",
          "info",
          `Service has been ${service.isActive ? "activated" : "deactivated"}.`
        );

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? "activated" : "deactivated"}`,
      data: service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const deleteSubService = async (req, res) => {
  try {
    const { serviceId, subServiceId } = req.params;

    // Find parent service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if sub-service exists
    const subService = service.subServices.id(subServiceId);
    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "Sub-service not found",
      });
    }

    // Remove the sub-service
    subService.deleteOne();

    // Save the service
    await service.save();

    return res.status(200).json({
      success: true,
      message: "Sub-service deleted successfully",
      data: service,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const toggleSubService = async (req, res) => {
  try {
    const { serviceId, subServiceId } = req.params;

    // Find parent service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Find sub-service inside array
    const subService = service.subServices.id(subServiceId);
    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "Sub-service not found",
      });
    }

    // Toggle status
    subService.isActive = !subService.isActive;

    // Save service
    await service.save();

    return res.status(200).json({
      success: true,
      message: `Sub-service ${subService.isActive ? "activated" : "deactivated"}`,
      data: service,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
