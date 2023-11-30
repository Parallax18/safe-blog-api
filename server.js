require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Databse Connected Successfully!!");
  })
  .catch((err) => {
    console.log("Could not connect to the database", err);
    process.exit();
  });

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

const UserRoute = require("./app/routes/user-routes.js");
const PostRoute = require("./app/routes/post-routes.js");
const AuthRoute = require("./app/routes/auth-routes.js");
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/login", AuthRoute);
