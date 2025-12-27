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
      "success",
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
      "info",
      "Your password has been updated successfully."
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  console.log("Forgot password request received");
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Try sending email — but DO NOT stop process if it fails
    // try {
    //   await sendEmail({
    //     to: email,
    //     subject: "Password Reset OTP",
    //     html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 15 minutes.</p>`,
    //   });
    // } catch (err) {
    //   console.log("⚠ Email sending failed — ignoring and returning OTP in response");
    // }

    await logAudit(user._id, "forgot_password", "User", user._id);

    // Always return OTP — no emailSent flag
    return res.json({
      success: true,
      email: user.email,
      otp,
      message: "OTP generated successfully",
    });

  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });

    // Check OTP
    if (
      user.passwordResetOTP !== otp ||
      Date.now() > user.passwordResetOTPExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update password (pre-save hook will hash)
    user.password = newPassword;

    // Clear OTP
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;

    await user.save();

    await logAudit(user._id, "reset_password", "User", user._id);

    await createNotification(
      user._id,
      "Password Reset",
      "info",
      "Your password has been reset successfully."
    );

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getDeliveryAddress = (req, res) => {
  try {
    const address = process.env.MY_ADDRESS || "Address not set";
    res.json({ success: true, address });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};