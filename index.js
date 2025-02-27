require("dotenv").config();

const express = require("express");
const session = require("express-session");

const authUser = require("./Middleware/authUser");
const userRoute = require("./Router/userRoute");
const databaseController = require("./Controllers/databaseController");
const flash = require("express-flash");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", "./Views");

app.use(flash());

// resave and saveUninitialized are set to false to avoid unnecessary writes to the session store
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(authUser.setUserAuth);
app.use(userRoute);

databaseController()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

