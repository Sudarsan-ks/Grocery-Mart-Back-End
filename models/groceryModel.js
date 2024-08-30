const mongoose = require("mongoose");

const grocerySchema = mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Fruit and Vegetable",
      "Bakery Items",
      "Meat and Seafood",
      "Pantry Staples",
      "Beverages",
      "Snacks and Confectionery",
      "Household Supplies",
      "Baby Products",
      "Pet Supplies",
    ],
    required: true,
  },
  pricePerKg: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: { type: String, required: true },
  availability: {
    type: String,
    enum: ["In Stock", "Out Of Stock"],
    required: true,
  },
});

const Grocery = mongoose.model("grocery", grocerySchema);
module.exports = Grocery;
