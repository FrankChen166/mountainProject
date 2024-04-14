const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const bodyPraser = require("body-parser");
const fs = require("fs");
const { promisify } = require("util");
const app = express();

const Product = require("./Schema/product");
const Detail = require("./Schema/detail");
const Sell = require("./Schema/sell");
const methodOverride = require("method-override");
const { stringify } = require("querystring");

const writeFileAsync = promisify(fs.writeFile);

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

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).populate("details");
  res.render("show", { product });
});

app.post("/product", async (req, res) => {
  const productData = req.body;
  const product = new Product(productData);
  await product
    .save()
    .then(async () => {
      console.log("Product is saved successfully");

      // 重新獲取整個產品，並填入詳細資訊
      const populatedProduct = await Product.findById(product._id).populate(
        "details"
      );

      const productJson = populatedProduct.toJSON(); // 將產品轉換為 JSON 物件

      const filePath = path.join(
        __dirname,
        "bigProduct",
        `${product._id}.json`
      ); // 假設存儲產品 JSON 檔案的路徑為 "./products"

      await writeFileAsync(filePath, JSON.stringify(productJson, null, 2)); // 寫入 JSON 檔案

      console.log("Product JSON file saved successfully");

      res.redirect("/product");
    })
    .catch((err) => {
      console.error("Error saving product:", err);
      return res.status(500).send(err);
    });
});

app.get("/product/:id/detail", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  res.render("detail", { product });
});

app.post("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, quantity, color } = req.body;

  try {
    const newDetail = new Detail({ name, quantity, color });
    await newDetail.save();

    const product = await Product.findById(productId).populate("details");

    // 將新增的小項加入大項的詳細資訊中
    product.details.push(newDetail);
    await product.save(); // 保存大項以更新數據庫

    // 轉換大項為 JSON 物件
    const productJson = product.toJSON();

    // 寫入大項 JSON 檔案
    const productsDirectory = path.join(__dirname, "products");
    if (!fs.existsSync(productsDirectory)) {
      fs.mkdirSync(productsDirectory, { recursive: true });
    }
    const filePath = path.join(productsDirectory, `${product._id}.json`);
    await writeFileAsync(filePath, JSON.stringify(productJson, null, 2));

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

app.post("/product/:id/detail/detailInfo/:detailId/edit", async (req, res) => {
  try {
    const productId = req.params.id;
    const detailId = req.params.detailId;
    const { name, quantity, color } = req.body;
    const newData = { name, quantity, color }; // 使用新的物件保存更新的資料

    const updatedDetail = await Detail.findByIdAndUpdate(detailId, newData, {
      new: true,
    });

    if (!updatedDetail) {
      return res.status(404).send("Detail not found");
    }

    const filePath = path.join(__dirname, "products", `${productId}.json`);
    let existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const detailIndex = existingData.details.findIndex(
      (detail) => detail._id === detailId
    );
    if (detailIndex === -1) {
      return res.status(404).send("Detail not found");
    }

    existingData.details[detailIndex].name = updatedDetail.name;
    existingData.details[detailIndex].quantity = updatedDetail.quantity;
    existingData.details[detailIndex].color = updatedDetail.color;

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    const product = await Product.findById(productId).populate("details");
    const detail = await Detail.findById(detailId);

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
    const productId = req.params.id;
    const detailId = req.params.detailId;

    // 從資料庫中刪除細節資料
    const deleteResult = await Detail.deleteOne({ _id: detailId });
    console.log(`Deleted detail with ID ${detailId}:`, deleteResult);

    // 讀取現有的 JSON 檔案
    const filePath = path.join(__dirname, "products", `${productId}.json`);
    let existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // 找到需要刪除的細節
    const detailIndex = existingData.details.findIndex(
      (detail) => detail._id === detailId
    );
    if (detailIndex !== -1) {
      // 從 JSON 中刪除細節
      existingData.details.splice(detailIndex, 1);

      // 寫回 JSON 檔案
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    }

    // 发送成功响应，表示删除成功
    return res.redirect(`/product/${req.params.id}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // 從資料庫中刪除產品
    const deleteResult = await Product.deleteOne({ _id: productId });
    console.log(`Deleted product with ID ${productId}:`, deleteResult);

    // 從 JSON 檔案中刪除產品
    const filePath = path.join(__dirname, "products", `${productId}.json`);
    fs.unlinkSync(filePath);

    // 發送成功响应，表示刪除成功
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

app.get("/products/:productId", async (req, res) => {
  const products = await Product.find();
  const productId = req.params.productId;
  const filePath = `/Users/chirenchen/mountainProject/products/${productId}.json`;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error reading JSON file" });
      return;
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.post("/sell", async (req, res) => {
  try {
    const products = await Product.find();
    const productId = req.body.productId; // 使用 req.body.productId
    // const products = await Product.findById(productId);
    const { productName, productDetail, productColor, quantity } = req.body;

    const newData = {
      productName: productName,
      productDetail: productDetail,
      productColor: productColor,
      quantity: parseInt(quantity),
    };

    const filePath = path.join(__dirname, "Sell", `${productId}.json`);

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.log("json file does not exist, creating a new one");
        fs.writeFile(filePath, JSON.stringify([newData], null, 2), (err) => {
          if (err) {
            console.log("error writing file", err);
            return res.status(500).send("error writing file");
          }
          console.log("New JSON file created and data saved successfully");
          res.render("sellHome", { products: products });
        });
      } else {
        let jsonData = JSON.parse(data);
        let found = false;

        for (let i = 0; i < jsonData.length; i++) {
          if (
            jsonData[i].productName === productName &&
            jsonData[i].productDetail === productDetail &&
            jsonData[i].productColor === productColor // 修改這裡，將 jsonData 改為 jsonData[i]
          ) {
            jsonData[i].quantity += parseInt(quantity);
            found = true;
            break;
          }
        }
        if (!found) {
          jsonData.push(newData);
        }
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            console.log("error writing file", err);
            return res.status(500).send("error writing ");
          }
          console.log("JSON file updated successfully");
          res.render("sellHome", { products: products });
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("sucess");
});
