import Notification from "../models/Notification.js";

// ---------------- GET NOTIFICATIONS ----------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    // Pagination query params
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Safety: no negative values
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    // Total count
    const total = await Notification.countDocuments({ user: userId });

    // Fetch paginated notifications
    const notifications = await Notification.find({ user: userId, isRead: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

export const clearAll = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.deleteMany({ user: userId });
    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};