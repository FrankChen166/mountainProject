// const mongoose = require("mongoose");

// const { Schema } = mongoose;

// const detailSchema = new Schema({
//   name: String,
//   product: {
//     type: Schema.Types.ObjectId,
//     ref: "Product",
//   },
//   variations: [
//     {
//       name: String,
//       quantity: Number,
//       color: String,
//       arrivalDate: {
//         type: Date,
//         default: Date.now, // 默認值為當前時間
//       },
//     },
//   ],
// });

// module.exports = mongoose.model("Detail", detailSchema);

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
});

module.exports = mongoose.model("Detail", detailSchema);
