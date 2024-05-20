import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";

import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./data/config.env",
});

export const app = express();

// Using Middlewares
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payment/webhooks') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use(cookieParser());
app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
  })
);

// Importing Routers here
import admin from "./routes/admin.js";
import user from "./routes/user.js";
import cart from './routes/cart.js';
import product from "./routes/product.js";
import order from "./routes/order.js";
import categories from "./routes/category.js";
import companycharge from "./routes/companycharge.js";
import coupon from "./routes/coupon.js";
import payment from "./routes/payment.js";

app.get("/test", (req, res) => {
  return res.json({
    message: "API works fine!"
  });
});

app.use("/api/v1/admin", admin);
app.use("/api/v1/user", user);
app.use("/api/v1/cart", cart);
app.use("/api/v1/categories", categories);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
app.use("/api/v1/payment", payment);
app.use("/api/v1/companycharges", companycharge);
app.use("/api/v1/coupon", coupon);


// Using Error Middleware
app.use(errorMiddleware);
