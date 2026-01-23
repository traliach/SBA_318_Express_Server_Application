import { Router } from "express";
import { reviews } from "../../data/store.js";
import { findById } from "../../data/helpers.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ count: reviews.length, data: reviews });
});

router.get("/:reviewId", (req, res) => {
  const review = findById(reviews, req.params.reviewId);
  if (!review) return res.status(404).json({ error: "Review not found" });
  res.json(review);
});

export default router;
