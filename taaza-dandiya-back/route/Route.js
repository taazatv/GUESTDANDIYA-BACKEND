const express = require("express");
const router = express.Router();
const { uploadUserInfo, verifyCoupon, getUsers, getCoupons } = require("../controllers/Controllers");

router.post("/verify-coupon", verifyCoupon);
router.post("/submit-user", uploadUserInfo);
router.get("/users", getUsers);
router.get("/coupons", getCoupons);

module.exports = router;
