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

exports.uploadUserInfo = async (req, res) => {
  const { name, phone, aadhaar, email, coupon, eventDate, userReference } = req.body;

  try {
    // Booking date
    const bookingDate = new Date();
    const bookingDateString = bookingDate.toLocaleDateString("en-GB"); // "dd/mm/yyyy"

    // Event date (dd-mm-yyyy format expected from DB / frontend)
    const [day] = eventDate.split("-"); // sirf day le rahe hain
    const dayString = day.padStart(2, "0"); // ensure 2 digit (e.g. "01")

    // Token generate
    const token = coupon[0] + dayString + coupon.slice(1) + phone.slice(-4);

    // Create user
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

    // Mark coupon as used
    await Coupon.updateOne(
      { Coupons: coupon },
      { $set: { isUsed: true } }
    );


    const smsUrl = `http://web.poweredsms.com/submitsms.jsp?user=TAZATV&key=44426475efXX&mobile=${encodeURIComponent(
      phone
    )}&message=${encodeURIComponent(
      `Confirmed! Booking ID ${token}. You are entitled to ${1} ticket dated ${eventDate} for Taaza Dandiya @Netaji Indoor Stadium. Rights of admission reserved. T%26C apply. Go to the Ticket counter at venue to redeem. -Taaza Infotainment pvt ltd`
    )}&senderid=TAZATV&accusage=1&accusage=1&entityid=1201159437599755635&tempid=1407175869764832497`;

    try {
      const smsResponse = await axios.get(smsUrl);
      console.log("SMS sent successfully to user:", smsResponse.data);
    } catch (error) {
      console.error("Error sending SMS to user:", error);
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
