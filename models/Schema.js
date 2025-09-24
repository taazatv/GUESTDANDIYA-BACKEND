const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  aadhaar: { type: String, required: true },
  email: { type: String, required: true },
  bookingDate: { type: String, required: true }, // auto today date
  coupon: { type: String, required: true },
  token: { type: String, required: true },
  reference: { type: String },
  eventDate: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
