import mongoose from "mongoose";
import { app_module } from "./app";
import { BACKEND_PORT } from "./config";
import { bot_module } from "./bot";

// Connect to MongoDB
mongoose
  .connect("mongodb://mongo:27017/talkishDB", { useNewUrlParser: true })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));

var db = mongoose.connection;

const bot = bot_module(db);
bot.launch();

// backend
const app = app_module();
app.listen(BACKEND_PORT, () => {
  console.log(`server running on port ${BACKEND_PORT}`);
});
