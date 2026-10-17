import User from "../models/User.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, phone, password, role = "client", city, preferences } = req.body;
    const rawMobile = (mobile || phone || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Mobile number validation (10-digit Indian number)
    if (rawMobile) {
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (!indianMobileRegex.test(rawMobile)) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must be a valid 10-digit Indian number starting with 6-9.",
        });
      }
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (rawMobile) {
      const existingMobile = await User.findOne({
        $or: [{ mobile: rawMobile }, { phone: rawMobile }],
      });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "An account with this mobile number already exists.",
        });
      }
    }

    const user = await User.create({
      name: name?.trim() || email.split("@")[0],
      email: email.toLowerCase().trim(),
      mobile: rawMobile || undefined,
      phone: rawMobile || "",
      password,
      role: ["client", "architect", "worker", "admin"].includes(role) ? role : "client",
      city: city || "Bangalore",
      preferences: preferences || undefined,
    });

    const token = user.generateAuthToken();
    res.cookie("token", token, cookieOptions);
    res.cookie("sthavya_jwt", token, cookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user.",
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token (Login with email or mobile number + password)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { identifier, email, mobile, phone, password, rememberMe } = req.body;
    const loginIdentifier = (identifier || email || mobile || phone || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number, and password are required.",
      });
    }

    // Check if identifier is a 10-digit mobile number or an email
    let userQuery = {};
    if (/^[6-9]\d{9}$/.test(loginIdentifier)) {
      userQuery = { $or: [{ mobile: loginIdentifier }, { phone: loginIdentifier }] };
    } else {
      userQuery = { email: loginIdentifier.toLowerCase() };
    }

    const user = await User.findOne(userQuery).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password.",
      });
    }

    const token = user.generateAuthToken();
    const dynamicCookieOptions = {
      ...cookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, dynamicCookieOptions);
    res.cookie("sthavya_jwt", token, dynamicCookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

/**
 * @desc    Sign out user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = async (req, res) => {
  const clearOptions = {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  res.cookie("token", "", clearOptions);
  res.cookie("sthavya_jwt", "", clearOptions);

  res.json({
    success: true,
    message: "Logged out successfully.",
  });
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update user profile & preferences
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, preferences, avatar } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (preferences !== undefined) updates.preferences = preferences;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

export default { registerUser, loginUser, logoutUser, getMe, updateProfile };
