// utils/auditLogger.js
import Notification from "../models/Notification.js";

export async function createNotification(user, title, type, message) {
  try {
    const notification = new Notification({
      user,
      title,
      type,
      message,
    });
    await notification.save();
  } catch (err) {
    // don't throw - auditing should not break workflows; optionally log
    console.error("Notification creation failed:", err);
  }
}
