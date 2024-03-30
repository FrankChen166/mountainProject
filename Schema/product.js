// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     minLength: 1,
//   },
// });

// module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
  },
  details: [
    {
      type: Schema.Types.ObjectId,
      ref: "Detail",
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
