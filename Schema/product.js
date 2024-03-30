const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
  },
});

module.exports = mongoose.model("Product", productSchema);
