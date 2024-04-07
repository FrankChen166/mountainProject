const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const bodyPraser = require("body-parser");

const app = express();

const Product = require("./Schema/product");
const Detail = require("./Schema/detail");
const product = require("./Schema/product");
const methodOverride = require("method-override");

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
app.use(methodOverride("_method"));

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

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).populate("details");
  res.render("show", { product });
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
    const newDetail = new Detail({ name, quantity, color });
    await newDetail.save();
    const product = await Product.findById(productId);
    product.details.push(newDetail._id);
    await product.save();
    res.redirect(`/product/${productId}`);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/product/:id/detail/detailInfo", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate("details");

    if (!product) {
      return res.status(404).send("Product not found");
    }
    const detailId = req.query.detailId;
    const detail = await Detail.findById(detailId);
    res.render("detailInfo", { product, detail });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/product/:id/detail/detailInfo/:detailId/edit", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate("details");
    if (!product) {
      return res.status(404).send("Product not found");
    }
    const detailId = req.params.detailId;
    const detail = await Detail.findById(detailId); // 根据detailId查找相应的详细信息
    if (!detail) {
      return res.status(404).send("Detail not found");
    }

    // 渲染模板并传递产品和详细信息对象
    res.render("edit", { product, detail });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/product/:id/detail/detailInfo/:detailId/edit", async (req, res) => {
  try {
    const detailId = req.params.detailId;
    const { name, quantity, color } = req.body;

    const updatedDetail = await Detail.findByIdAndUpdate(
      detailId,
      { name, quantity, color },
      { new: true }
    );

    if (!updatedDetail) {
      return res.status(404).send("Detail not found");
    }

    res.redirect(
      `/product/${req.params.id}/detail/detailInfo?detailId=${detailId}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/product/:id/detail/detailInfo/:detailId", async (req, res) => {
  try {
    const detailId = req.params.detailId;
    const deleteResult = await Detail.deleteOne({ _id: detailId });
    console.log(`Deleted detail with ID ${detailId}:`, deleteResult);
    // res.sendStatus(204); // 发送成功响应，表示删除成功
    return res.redirect("/product");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log({ id });
    const deleteResult = await Product.deleteOne({ _id: id });
    console.log(`Deleted prodict with ID ${id}:`, deleteResult);
    // res.sendStatus(204); // 发送成功响应，表示删除成功
    return res.redirect("/product");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("sucess");
});
