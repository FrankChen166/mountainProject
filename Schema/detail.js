const mongoose = require("mongoose");

const { Schema } = mongoose;

const detailSchema = new Schema({
  name: String,
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  variations: [
    {
      type: String,
      quantity: Number,
      color: String,
      size: String,
      arrivalDate: {
        type: Date,
        default: Date.now, // 默認值為當前時間
      },
    },
  ],
});

module.exports = mongoose.model("Detail", detailSchema);
