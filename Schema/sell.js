const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sellSchema = new Schema({
  productName: String,
  productDetail: String,
  productColor: String,
  quantity: { type: Number, default: 0 },
  sellDate: {
    type: Date,
    default: Date.now, // 默認值為當前時間
  },
});

module.exports = mongoose.model("Sell", sellSchema);
