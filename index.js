const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const UserRouter = require("./routes/userRouter");
const GroceryRouter = require("./routes/groceryRouter");
const OrderRouter = require("./routes/orderRouter");
const CartRouter = require("./routes/addToCart");
const AddressRouter = require("./routes/addressRouter");

const PORT = process.env.PORT;
const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_NETLIFY,
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.use("/user", UserRouter);
app.use("/cart", CartRouter);
app.use("/grocery", GroceryRouter);
app.use("/order", OrderRouter);
app.use("/address", AddressRouter);

app.get("/", (req, res) => {
  res.send("WELCOME TO GROCERY MART");
});

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("MongoDB is connected");
  app.listen(PORT, () => {
    console.log(`Server is started on port number ${PORT}`);
  });
});
