const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const app = express();

const { productSchema } = require("./schema.js");

mongoose
  .connect("mongodb://localhost:27017/mountain")
  .then(() => {
    console.log("connecting to mongodb");
  })
  .catch((e) => {
    console.log(e);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/product", (req, res) => {
  res.render("home");
});

app.get("/productDetail/:item", (req, res) => {
  const item = req.params.item;
  res.render("detail", { item: item });
});

app.get("/productNew", (req, res) => {
  res.render("new");
});

app.post("/");

app.listen(3000, () => {
  console.log("sucess");
});
