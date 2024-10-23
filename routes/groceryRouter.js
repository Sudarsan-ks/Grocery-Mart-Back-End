const express = require("express");
const Grocery = require("../models/groceryModel");
const User = require("../models/userModel");
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

    const newGrocery = {
      name,
      category,
      pricePerKg,
      image,
      rating,
      description,
      availability,
    };
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
      const updatedGrocery = await Grocery.findByIdAndUpdate(ID, updatedData,{
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

module.exports = router;
