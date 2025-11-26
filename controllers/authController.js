// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/createNotification.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "7d";

// Create JWT
const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    if (!email || !password || !firstName || !lastName || !phone)
      return res.status(400).json({
        success: false,
        message:
          "Email, Password, First Name, Last Name, and Phone are required",
      });

    if(password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Email already used" });

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });
    await user.save();

    await createNotification(
      user._id,
      "Welcome!",
      "In-App",
      "Your account has been created successfully."
    );

    await sendEmail({
      to: email,
      subject: "Registration Successful",
      html: `<p>Hello ${firstName}, your account is created successfully.</p>`,
    });

    await logAudit(user._id, "register", "User", user._id);

    const token = signToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });

    const user = await User.findOne({
      $or: [{ email: username }, { phone: username }],
    });
    if (!user)
      return res.status(401).json({ success: false, message: "User Not Exist" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = signToken({ id: user._id, role: user.role });

    await logAudit(user._id, "login", "User", user._id, { ip: req.ip });

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- PROFILE ----------------
export const profile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const allowed = ["firstName", "lastName", "phone"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    await logAudit(user._id, "update_profile", "User", user._id);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ---------------- CHANGE PASSWORD ----------------
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(oldPassword);

    if (!match)
      return res
        .status(403)
        .json({ success: false, message: "Old password incorrect" });

    user.password = newPassword; // auto-hashed by pre-save hook
    await user.save();

    await logAudit(user._id, "change_password", "User", user._id);

    await createNotification(
      user._id,
      "Password Changed",
      "In-App",
      "Your password has been updated successfully."
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
