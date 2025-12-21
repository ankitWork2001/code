import express from "express";
import { upload } from "../middlewares/upload.js";
import { uploadToDrive } from "../middlewares/googleDriveService.js";

const router = express.Router();

router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    // Process all files in parallel
    const uploadPromises = req.files.map(file => uploadToDrive(file));
    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: "Files uploaded to Google Drive successfully",
      files: results, // Returns array of { id, webViewLink }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;