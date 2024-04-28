const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  color: String,
});
module.exports = mongoose.model("Stock", stockSchema);
