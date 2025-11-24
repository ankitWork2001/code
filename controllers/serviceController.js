import Service from "../models/Service.js";
import { createNotification } from "../utils/createNotification.js";

// Create a new service
export const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      requiredDocuments,
      estimatedProcessingDays,
      formFields,
    } = req.body;

    console.log("Creating service with data:", req.body);

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

    // Validate formFields
    if (formFields && !Array.isArray(formFields)) {
      return res.status(400).json({
        success: false,
        message: "formFields must be an array",
      });
    }

    const newService = new Service({
      name: name.trim(),
      description,
      requiredDocuments: requiredDocuments || [],
      estimatedProcessingDays: estimatedProcessingDays || 0,
      formFields: formFields || [],
    });

    const savedService = await newService.save();

    await createNotification(
          req.userId,
          "Service Created",
          "In-App",
          "A new service has been created successfully."
        );

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: savedService,
    });
  } catch (error) {
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
    const services = await Service.find();
    res.status(200).json({ success: true, data: services });
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
  console.log("Updating service with data:", req.body);
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

    await createNotification(
          req.userId,
          "Service Updated",
          "In-App",
          "A service has been updated successfully."
        );

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

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? "activated" : "deactivated"}`,
      data: service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};