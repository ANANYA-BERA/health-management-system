const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db.js");
const UserRouter = require("./src/routers/user.route.js");
const StepRouter = require("./src/routers/steps.route.js");
const HeartRateRoute = require("./src/routers/heartRate.route.js");
const CalorieBurnedRoute = require("./src/routers/calorieBurned.route.js");
const BodyTempRoute = require("./src/routers/bodyTemp.route.js"); 

const app = express();
const port = process.env.PORT || 5000;

// Core middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allowed frontend origins (localhost & 127.0.0.1)
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman, curl, server-to-server
      if (!origin || origin === "null") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Extra headers for preflight / legacy handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});



app.use("/", UserRouter);
app.use("/", StepRouter);
app.use("/", HeartRateRoute);
app.use("/", CalorieBurnedRoute);
app.use("/", BodyTempRoute);

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`server is running at http://localhost:${port}`);
    })
})
.catch((error) => {
    console.log("MongoDb connection lost..!!", error.message);
})