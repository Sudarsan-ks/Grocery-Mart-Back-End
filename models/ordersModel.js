const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "grocery",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Cancel", "Shipped", "Confirmed"],
      default: "Pending",
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
