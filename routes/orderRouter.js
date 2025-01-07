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
    await Cart.findOneAndDelete({ user: userID });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(501).json({ message: "Error in Payment", error });
  }
});

router.post("/verifyPayment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const generateSignature = await crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (generateSignature !== razorpay_signature) {
      return res.status(404).json({ message: "Invalid Payment accured" });
    }
    res
      .status(200)
      .json({ success: true, message: "Payment Verified Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error in verifying the Payment" });
  }
});

router.get("/getOrder", async (req, res) => {
  try {
    const order = await Order.find().populate("user");
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Ordereddata", error });
  }
});

router.get("/getOrder/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const order = await Order.find({ user: userID }).populate(
      "items.product",
      "user"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching OrderedData", error });
  }
});

router.get("/getOrderDetails/:orderID", async (req, res) => {
  const { orderID } = req.params;
  try {
    const order = await Order.findById(orderID).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching OrderedData", error });
  }
});

router.put("/updateStatus/:orderID", async (req, res) => {
  const { orderID } = req.params;
  const updatedData = req.body;
  try {
    const updatedStatus = await Order.findOneAndUpdate(
      { _id: orderID },
      updatedData,
      { new: true }
    );
    if (!updatedStatus) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ updatedStatus });
  } catch (error) {
    res.status(500).json({ message: "Error in Updating Status", error });
  }
});

router.delete("/deleteorder/:orderID", async (req, res) => {
  const { orderID } = req.params;
  try {
    const deleteOrder = await Order.findByIdAndDelete(orderID);
    if (!deleteOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ Message: "Order Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching OrderedData", error });
  }
});

module.exports = router;
