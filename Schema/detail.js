const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const detailSchema = new Schema({
  name: String,
  quantity: Number,
  color: String,
  arrivalDate: {
    type: Date,
    default: Date.now, // 默認值為當前時間
  },
  sells: [
    {
      type: Schema.Types.ObjectId,
      ref: "Sell",
    },
  ],
});

module.exports = mongoose.model("Detail", detailSchema);
