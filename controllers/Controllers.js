const User = require("../models/Schema");
const Coupon = require("../models/CouponSchema");
const axios = require("axios");

// Verify coupon
exports.verifyCoupon = async (req, res) => {
  const { coupon } = req.body;
  try {
    const existing = await Coupon.findOne({ Coupons: coupon });

    if (!existing) {
      return res.json({ valid: false, message: "Coupon not found" });
    }

    if (existing.isUsed) {
      return res.json({ valid: false, message: "Coupon already used" });
    }

    const userWithCoupon = await User.findOne({ coupon });
    if (userWithCoupon) {
      return res.json({ valid: false, message: "Coupon already assigned to a user" });
    }

    res.json({
      valid: true,
      eventDate: existing.EventDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying coupon." });
  }
};

// Submit user info
// controller (assumes `axios` is already required at top of the file)
exports.uploadUserInfo = async (req, res) => {
  const { name, phone, aadhaar, email, coupon, userReference } = req.body;

  try {
    // 1) Coupon DB me check karo
    const couponDoc = await Coupon.findOne({ Coupons: coupon });
    if (!couponDoc) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    // 2) Coupon ke DB se eventDate lo
    const eventDate = new Date(couponDoc.eventDate);
    if (isNaN(eventDate)) {
      return res.status(400).json({ message: "Invalid event date in coupon" });
    }

    // 3) Day nikaalo (2 digit)
    const eventDay = eventDate.getDate().toString().padStart(2, "0"); // "29"

    // 4) Token banao
    const token =
      coupon[0] + eventDay + coupon.slice(1) + phone.slice(-4);

    // 5) Booking date (today)
    const bookingDateString = new Date().toLocaleDateString("en-GB");

    // 6) User save karo
    const newUser = await User.create({
      name,
      phone,
      aadhaar,
      email,
      bookingDate: bookingDateString,
      coupon,
      token,
      reference: userReference,
      eventDate
    });

    // 7) Coupon ko used mark karo
    await Coupon.updateOne(
      { Coupons: coupon },
      { $set: { isUsed: true } }
    );

    // 8) SMS bhejo (poora date dd/mm/yyyy)
    const smsDate = eventDate.toLocaleDateString("en-GB"); // "29/09/2025"
    const smsMessage = `Confirmed! Booking ID ${token}. You are entitled to 1 ticket dated ${smsDate} for Taaza Dandiya @Netaji Indoor Stadium subject to clearance of payment. T&C apply. Go to the Ticket counter at venue to redeem. -TaazaTv`;

    const smsUrl = `http://web.poweredsms.com/submitsms.jsp?user=TAZATV&key=44426475efXX&mobile=${encodeURIComponent(
      phone
    )}&message=${encodeURIComponent(smsMessage)}&senderid=TAZATV&accusage=1&entityid=1201159437599755635&tempid=1407172691488658047`;

    try {
      const smsResponse = await axios.get(smsUrl);
      console.log("SMS sent successfully:", smsResponse.data);
    } catch (smsErr) {
      console.error("Error sending SMS:", smsErr.message);
    }

    res.status(200).json({ msg: "Success", data: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};




// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get all coupons (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons" });
  }
};
