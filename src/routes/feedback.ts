import { Router } from "express";

const Feedback = require("../models/Feedback");

const router = Router();

router.get("/get_feedback", (req, res) => {
  Feedback.find()
    .then((items: any) => res.status(200).json(items))
    .catch(() => res.status(404).json({ msg: "No items found " }));
});

export default router;
