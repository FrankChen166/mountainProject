const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const bodyPraser = require("body-parser");

const app = express();

const Product = require("./Schema/product");
const Detail = require("./Schema/detail");

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

app.get("/product", async (req, res) => {
  const products = await Product.find({});
  res.render("home", { products });
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
      res.redirect("/product");
    })
    .catch((err) => {
      console.log("error saving product");
      return res.status(500).send("Error saving Product");
    });
});

app.get("/product/:id/detail", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  res.render("detail", { product });
});

app.post("/product/:id", async (req, res) => {
  const productId = req.params.id;
  console.log(productId);
  const { name, quantity, color } = req.body;

  try {
    const product = await Product.findById(productId);
    const newDetail = new Detail({ name, quantity, color });
    await newDetail.save();

    await product.save();
    res.redirect(`/product/${productId}`);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  const detail = await Detail.findById(productId);
  res.render("show", { product, detail });
});

app.listen(3000, () => {
  console.log("sucess");
});
