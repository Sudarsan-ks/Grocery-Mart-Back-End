const express = require("express");
const Order = require("../models/ordersModel");
const Razorpay = require("razorpay");
const Cart = require("../models/addToCart");
const crypto = require("crypto");
const router = express.Router();

router.post("/payment", async (req, res) => {
  const rarzorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const { userID } = req.body;
  try {
    const cart = await Cart.findOne({ user: userID }).populate("items.product");
    if (!cart) {
      return res.status(403).json({ message: "Cart not found" });
    }
    const razorpayOrder = await rarzorpay.orders.create({
      amount: cart.totalPrice * 100,
      currency: "INR",
      receipt: crypto.randomBytes(16).toString("hex"),
    });
    const order = new Order({
      user: userID,
      items: cart.items,
      totalAmount: cart.totalPrice,
      status: "Pending",
    });
    await order.save();
    await Cart.findOneAndDelete({ user: userId });

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    res.status(501).json({ message: "Error in payment", error });
  }
});

router.get("/getOrder", async (req, res) => {
  try {
    const order = await Order.find();
    res.status(201).json(order);
  } catch (error) {
    res.status(502).json({ message: "Error fetching Ordereddata", error });
  }
});

router.get("/getOrder/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const order = await Order.findOne({ user: userID }).populate(
      "items.product"
    );
    if (!order) {
      return res.status(402).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(502).json({ message: "Error fetching OrderedData", error });
  }
});

module.exports = router;
