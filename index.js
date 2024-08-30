const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const UserRouter = require("./routes/userRouter");
const GroceryRouter = require("./routes/groceryRouter");
const OrderRouter = require("./routes/orderRouter");
const CartRouter = require("./routes/addToCart");

const PORT = process.env.PORT;
const app = express();

const corsOptions = {
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_NETLIFY],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/user", UserRouter);
app.use("/cart", CartRouter);
app.use("/grocery", GroceryRouter);
app.use("/order", OrderRouter);

app.get("/", (req, res) => {
  res.send("WELCOME TO GROCERY MART");
});

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("MongoDB is connected");
  app.listen(PORT, () => {
    console.log(`Server is started on port number ${PORT}`);
  });
});
