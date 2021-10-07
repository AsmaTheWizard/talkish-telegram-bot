var timestamps = require("mongoose-timestamp");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  chat_id: {
    type: String,
    required: true,
  },

  overall: {
    type: String,
    required: true,
  },
  support: {
    type: String,
    required: true,
  },
});

FeedbackSchema.plugin(timestamps);

module.exports = Feedback = mongoose.model("feedback", FeedbackSchema);
