import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      default: "STHAVYA Client",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "architect", "worker", "admin"],
      default: "client",
      index: true,
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&auto=format",
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "Bangalore",
      trim: true,
    },
    preferences: {
      preferredStyle: {
        type: String,
        enum: ["Modern", "Luxury", "Traditional", "Minimalist", "Japandi", "Boho Chic"],
        default: "Modern",
      },
      budgetTier: {
        type: String,
        default: "₹25 - 35 Lakhs",
      },
      region: {
        type: String,
        default: "Bangalore (High Cost)",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for displayName / photoURL backwards compatibility
userSchema.virtual("displayName").get(function () {
  return this.name;
});

userSchema.virtual("photoURL").get(function () {
  return this.avatar;
});

userSchema.virtual("phoneNumber").get(function () {
  return this.phone;
});

// Pre-save password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || "sthavyaspaces_jwt_dev_secret_fallback_key";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    secret,
    { expiresIn }
  );
};

export const User = mongoose.model("User", userSchema);
export default User;
