const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sellSchema = new Schema({
  productName: String,
  productDetail: String,
  quantity: { type: Number, default: 0 },
});

module.exports = mongoose.model("Sell", sellSchema);
