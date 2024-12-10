const express = require("express");
const Address = require("../models/addressModel");
const User = require("../models/userModel");
const router = express.Router();

router.post("/add-address", async (req, res) => {
  const { user, street, city, state, zip, country } = req.body;
  try {
    if (!user || !street || !city || !state || !zip || !country) {
      return res
        .status(400)
        .json({ message: "Please provide all require feilds" });
    }
    const newAddress = new Address({
      user,
      street,
      city,
      state,
      zip,
      country,
    });
    await newAddress.save();
    res
      .status(201)
      .json({ Message: "Address added successfully", address: newAddress });
  } catch (error) {
    res.status(500).json({ message: "Error adding a Address", error });
  }

  router.get("/get-address/:userID", async (req, res) => {
    const { userID } = req.params;
    try {
      const address = Address.findOne({ userID });
      if (!address) {
        return res.status(401).json({ message: "Address not found" });
      }
      res.status(200).json({ address });
    } catch (error) {
      res.status(501).json({ message: "Error in fetching address", error });
    }
  });
});

module.exports = router;