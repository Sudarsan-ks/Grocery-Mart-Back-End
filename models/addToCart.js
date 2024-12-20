const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "grocery",
    required: true,
  },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
});

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
