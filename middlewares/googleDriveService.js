import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export const uploadToDrive = async (file) => {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    // DEBUG: Ensure this prints the long ID, not "undefined" or a placeholder
    console.log("Attempting upload to Folder ID:", folderId);

    const fileMetadata = {
      name: file.originalname,
      parents: [folderId], // Mandatory to use YOUR quota
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      // Mandatory flags for service accounts
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // Success cleanup
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    console.log("Upload successful! File ID:", response.data.id);
    return response.data;
  } catch (error) {
    console.error("Detailed Google Drive Error:", error.response?.data || error.message);
    throw error;
  }
};