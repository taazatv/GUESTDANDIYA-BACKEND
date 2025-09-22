const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  Coupons: { type: String, required: true, unique: true },
  EventDate: { type: String, required: true },
  Reference: { type: String, required: true },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("coupon", couponSchema);
