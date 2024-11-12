const express = require("express");
const Cart = require("../models/addToCart");
const Grocery = require("../models/groceryModel");
const { auth } = require("./auth");
const router = express.Router();

router.post("/addCart", auth, authorizeRole("admin"), async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Grocery.findById(productId);
    if (!product) {
      return res.status(401).json({ message: "Product not found" });
    }
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }
    const existItem = cart.items.find((item) => item.product.equals(productId));
    if (existItem) {
      existItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.pricePerKg,
      });
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
});

router.get("/getCart", async (req, res) => {
  try {
    const userID = req.user._id;
    const cart = await Cart.find({ user: userID }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cartData", error });
  }
});

router.get("/getCart/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const cart = await Cart.findOne({ user: userID }).populate("items.product");
    if (!cart) {
      return res.status(403).json({ message: "Cart not found" });
    }
    res.status(202).json(cart);
  } catch (error) {
    res.status(501).json({ message: "Error fetching cartData", error });
  }
});

router.put("/editItem/:itemID", async (req, res) => {
  const { itemID } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ "items._id": itemID });
    const item = cart.items.id(itemID);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error });
  }
});

router.delete("/deleteItem/:cartID/:itemID", async (req, res) => {
  const { cartID, itemID } = req.params;
  try {
    const cart = await Cart.findOneAndUpdate(
      { _id: cartID },
      { $pull: { items: { _id: itemID } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(502).json({ message: "Error deleting cart item", error });
  }
});

module.exports = router;
