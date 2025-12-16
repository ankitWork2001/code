// routes/uploadRoutes.js
import express from "express";
import upload from "../middlewares/upload.js";
import path from "path";

const router = express.Router();

// POST /api/files/upload
router.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const uploadedFiles = req.files.map((file) => ({
    originalname: file.originalname,
    filename: file.filename,
    size: file.size,
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
  }));

  console.log("Files uploaded:", uploadedFiles);

  res.status(200).json({ success: true, files: uploadedFiles });
});

// Serve files statically
router.use("/uploads", express.static(path.join("uploads")));

export default router;
