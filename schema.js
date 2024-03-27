const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
    //   },
    //   sort: {
    //     type: String,
    //     minLength: 1,
    //   },
    //   price: {
    //     type: Number,
    //     minLength: 0,
    //   },
    //   quantity: {
    //     type: Number,
    //   },
  },
});

module.exports = mongoose.model("Product", productSchema);
