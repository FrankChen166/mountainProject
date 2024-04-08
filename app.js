const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const bodyPraser = require("body-parser");
const fs = require("fs").promises;

const app = express();

const Product = require("./Schema/product");
const Detail = require("./Schema/detail");
const Sell = require("./Schema/sell");
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

async function saveDataToJsonFile(data, filename) {
  try {
    const jsonData = await fs.readFile(filename, "utf-8");
    let parsedData = [];
    if (jsonData) {
      parsedData = JSON.parse(jsonData);
    }
    console.log(parsedData);
    parsedData.push(data);
    await fs.writeFile(filename, JSON.stringify(parsedData, null, 2));
    console.log(`data success to ${filename}`);
  } catch (e) {
    console.log(`error saving data a ${filename}`, e);
    throw e;
  }
}

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/product", async (req, res) => {
  const products = await Product.find({});
  res.render("product", { products });
});

app.get("/productNew", (req, res) => {
  res.render("new");
});

app.post("/product", async (req, res) => {
  const productData = req.body;
  const product = new Product(productData);
  await product.save();
  await saveDataToJsonFile(productData, "product.json") //加入json
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
    await saveDataToJsonFile({ name, quantity, color }, "details.json"); //加入json
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

app.get("/product/:id/detail/detailInfo/:detailId/fetch", async (req, res) => {
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
    res.render("fetch", { product, detail });
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
    return res.redirect(`/product/${req.params.id}`);
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
    console.log(`Deleted product with ID ${id}:`, deleteResult);
    // res.sendStatus(204); // 发送成功响应，表示删除成功
    return res.redirect("/product");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/sell", async (req, res) => {
  // const productId = req.query.productId;
  const products = await Product.find();
  res.render("sellHome", { products });
});

app.post("/sell", async (req, res) => {
  try {
    const { productName, productDetail, productColor, quantity } = req.body;
    let sell = await Sell.findOneAndUpdate(
      {
        productName: productName,
        productDetail: productDetail,
        productColor: productColor,
      },
      { $inc: { quantity: parseInt(quantity) } },
      { new: true, upsert: true }
    );
    res.render("sellHome");
  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("sucess");
});
