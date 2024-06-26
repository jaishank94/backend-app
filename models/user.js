import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  stripeCustomerId: {
    type: String,
  },
  email: {
    type: String,
    required: [false, "Please Enter Email"],
    unique: [true, "Email Already Exist"],
    validate: validator.isEmail,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please Enter Phone Number"],
    unique: [true, "Phone Number Already Exist"],
    // validate: validator.isMobilePhone,
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    minLength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  agentCode: {
    type: String,
  },
  profileType: {
    type: String,
    enum: ["big", "local", "farmer"],
    default: "local",
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  interests: {
    type: [String],
  },
  tradeType: {
    type: String,
  },
  referralCode: {
    type: String,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
  deleted: { type: Boolean, default: false } 
});

schema.pre('find', function() {
  const hasDeletedProperty = this.schema.obj.hasOwnProperty('deleted');
  if (hasDeletedProperty) {
    this.where({ deleted: { $ne: true } });
  }
});

schema.pre('findOne', function() {
  const hasDeletedProperty = this.schema.obj.hasOwnProperty('deleted');
  if (hasDeletedProperty) {
    this.where({ deleted: { $ne: true } });
  }
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const User = mongoose.model("User", schema);
