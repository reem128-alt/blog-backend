const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const path = require("path");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const app = express();
dbConnect();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://blog-seven-sigma-81.vercel.app","https://blog-backend-myeh.onrender.com/"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/comments", commentRoute);

app.listen(3000, () => {
  console.log("server is running");
});
