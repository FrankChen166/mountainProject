const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const bodyPraser = require("body-parser");

const app = express();

const Product = require("./schema.js");

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

app.use(bodyPraser.urlencoded({ extended: true }));
app.use(bodyPraser.json());

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

app.post("/product", async (req, res) => {
  const productData = req.body;
  const product = new Product(productData);
  await product
    .save()
    .then(() => {
      console.log("product is saved success");
      return res.render("show", { product });
    })
    .catch((err) => {
      console.log("error saving product");
      return res.status(500).send("Error saving Product");
    });
});

// app.get("/product/:id", async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   res.render("show", { product });
// });

app.listen(3000, () => {
  console.log("sucess");
});
