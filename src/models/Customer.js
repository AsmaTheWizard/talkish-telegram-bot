var timestamps = require("mongoose-timestamp");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  chat_id: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: String,
  },

  latitude: {
    type: String,
  },

  longitude: {
    type: String,
  },
});

CustomerSchema.plugin(timestamps);

module.exports = Customer = mongoose.model("customer", CustomerSchema);
