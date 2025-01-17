const express = require("express");
const Grocery = require("../models/groceryModel");
const { auth, authorizeRole } = require("./auth");
const router = express.Router();

router.post("/addGrocery", auth, authorizeRole("admin"), async (req, res) => {
  const {
    name,
    category,
    pricePerKg,
    image,
    rating,
    description,
    availability,
  } = req.body;
  try {
    if (
      !name ||
      !category ||
      !pricePerKg ||
      !image ||
      !rating ||
      !description ||
      !availability
    ) {
      return res
        .json(402)
        .json({ message: "Please provide all require feilds" });
    }

    const newGrocery = new Grocery({
      name,
      category,
      pricePerKg,
      image,
      rating,
      description,
      availability,
    });
    await newGrocery.save();
    res
      .status(201)
      .json({ message: "Grocery added successfully", grocery: newGrocery });
  } catch (error) {
    res.status(501).json({ message: "Error Adding grocery", error });
  }
});

router.get("/getGrocery", async (req, res) => {
  try {
    const grocery = await Grocery.find();
    res.status(200).json(grocery);
  } catch (error) {
    res.status(502).json({ message: "Error fetching the groceries", error });
  }
});

router.get("/getGroceryId/:ID", async (req, res) => {
  const { ID } = req.params;
  try {
    const grocery = await Grocery.findById(ID);
    if (!grocery) {
      return res.status(403).json({ message: "Grocery item not found" });
    }
    res.status(200).json(grocery);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the grocery", error });
  }
});

router.get("/getGroceryCategory/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const grocery = await Grocery.findById({ category: category });
    if (grocery.length === 0) {
      return res
        .status(403)
        .json({ message: "Grocery item not found for specified category" });
    }
    res.status(200).json(grocery);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the grocery", error });
  }
});

router.put(
  "/editGroceryId/:ID",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    const { ID } = req.params;
    const updatedData = req.body;
    try {
      const updatedGrocery = await Grocery.findByIdAndUpdate(ID, updatedData, {
        new: true,
        runValidators: true,
      });
      if (!updatedGrocery) {
        return res.status(400).json({ message: "Grocery item not found" });
      }
      res.status(202).json({
        message: "Grocery item updated successfully",
        grocery: updatedGrocery,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating grocery", error });
    }
  }
);

router.delete(
  "/deleteGroceryId/:ID",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    const { ID } = req.params;

    try {
      const deleteGrocery = await Grocery.findByIdAndDelete(ID);

      if (!deleteGrocery) {
        return res.status(404).json({ message: "Grocery item not found" });
      }

      res.status(200).json({ message: "Grocery item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting grocery", error });
    }
  }
);

router.get("/productCount", async (req, res) => {
  try {
    const productCount = await Grocery.countDocuments();
    res.status(202).json({
      message: "User count fetched successfully",
      count: productCount,
    });
  } catch (error) {
    res.status(502).json({
      message: "Error fetching Product count",
      error: error.message,
    });
  }
});

router.get("/InStock", async (req, res) => {
  try {
    const InStock = await Grocery.countDocuments({ availability: "In Stock" });
    res.status(200).json({
      message: "In Stock count fetched successfully",
      count: InStock,
    });
  } catch (error) {
    res.status(501).json({
      message: "Error fetching In Stock count",
      error: error.message,
    });
  }
});

router.get("/outOfStock", async (req, res) => {
  try {
    const outOfStock = await Grocery.countDocuments({
      availability: "Out Of Stock",
    });
    res.status(201).json({
      message: "Out of Stock count fetched successfully",
      count: outOfStock,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Out of Stock count",
      error: error.message,
    });
  }
});

router.get("/seasonal", async (req, res) => {
  try {
    const seasonal = await Grocery.countDocuments({
      availability: "Seasonal",
    });
    res.status(201).json({
      message: "Seasonal count fetched successfully",
      count: seasonal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Seasonal count",
      error: error.message,
    });
  }
});

module.exports = router;
