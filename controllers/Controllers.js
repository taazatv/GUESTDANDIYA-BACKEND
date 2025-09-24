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
  const { name, phone, aadhaar, email, coupon, eventDate: fallbackEventDate, userReference } = req.body;

  try {
    // 1) Find coupon doc in DB
    const couponDoc = await Coupon.findOne({ Coupons: coupon });
    if (!couponDoc) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    // Optional: prevent reuse
    if (couponDoc.isUsed) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    // 2) Get the date from coupon DB (try multiple likely fields), else fallback to request eventDate
    const rawCouponDate = couponDoc.eventDate || couponDoc.date || couponDoc.validDate || fallbackEventDate;
    let parsedCouponDate = rawCouponDate ? new Date(rawCouponDate) : null;

    // If parsing failed, fallback to request body eventDate
    if (!parsedCouponDate || isNaN(parsedCouponDate.getTime())) {
      parsedCouponDate = fallbackEventDate ? new Date(fallbackEventDate) : null;
    }

    if (!parsedCouponDate || isNaN(parsedCouponDate.getTime())) {
      return res.status(400).json({ message: "Event date not found in coupon and no valid eventDate provided" });
    }

    // 3) Extract day as two digits from coupon date
    const eventDay = parsedCouponDate.getDate().toString().padStart(2, "0"); // "29" or "05"

    // 4) Build token: firstChar + eventDay(2) + restOfCoupon + last4Phone
    const firstChar = coupon.charAt(0) || "";
    const restCoupon = coupon.slice(1) || "";
    const last4Phone = (phone || "").slice(-4);
    const token = `${firstChar}${eventDay}${restCoupon}${last4Phone}`;

    // 5) Booking date (when user registered)
    const bookingDateString = new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy

    // 6) Create user
    const newUser = await User.create({
      name,
      phone,
      aadhaar,
      email,
      bookingDate: bookingDateString,
      coupon,
      token,
      reference: userReference,
      eventDate: parsedCouponDate.toISOString() // store ISO for consistency
    });

    // 7) Mark coupon as used (you can make this atomic if needed)
    await Coupon.updateOne(
      { Coupons: coupon },
      { $set: { isUsed: true } }
    );

    // 8) Send SMS using the coupon date (formatted dd/mm/yyyy)
    const couponDateForSms = parsedCouponDate.toLocaleDateString("en-GB"); // "29/09/2025"
    const smsMessage = `Confirmed! Booking ID ${token}. You are entitled to 1 ticket dated ${couponDateForSms} for Taaza Dandiya @Netaji Indoor Stadium subject to clearance of payment. T&C apply. Go to the Ticket counter at venue to redeem. -TaazaTv`;

    const smsUrl = `http://web.poweredsms.com/submitsms.jsp?user=TAZATV&key=44426475efXX&mobile=${encodeURIComponent(
      phone
    )}&message=${encodeURIComponent(smsMessage)}&senderid=TAZATV&accusage=1&entityid=1201159437599755635&tempid=1407172691488658047`;

    try {
      const smsResponse = await axios.get(smsUrl);
      console.log("SMS sent successfully to user:", smsResponse.data);
    } catch (smsErr) {
      console.error("Error sending SMS to user:", smsErr?.response?.data || smsErr.message || smsErr);
      // don't fail the whole request just because SMS failed
    }

    return res.status(200).json({ msg: "Success", data: newUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
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
