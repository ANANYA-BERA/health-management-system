const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db.js");
const UserRouter = require("./src/routers/user.route.js");
const StepRouter = require("./src/routers/steps.route.js");
const HeartRateRoute = require("./src/routers/heartRate.route.js");
const CalorieBurnedRoute = require("./src/routers/calorieBurned.route.js");

const app = express();
const port = process.env.PORT || 5000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5501");
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

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`server is running at http://localhost:${port}`);
    })
})
.catch((error) => {
    console.log("MongoDb connection lost..!!", error.message);
})