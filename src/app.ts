import express from "express";

import { customers } from "./routes";
import { feedback } from "./routes";

export const app_module = () => {
  const app = express();
  app.use(express.json());

  app.use(customers);
  app.use(feedback);
  return app;
};
