import { Router } from "express";

const Customer = require("../models/Customer");

const router = Router();

router.get("/get_customers", (req, res) => {
  Customer.find()
    .then((items: any) => res.status(200).json(items))
    .catch(() => res.status(404).json({ msg: "No items found " }));
});

export default router;
