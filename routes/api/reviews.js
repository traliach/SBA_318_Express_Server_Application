import { Router } from "express";
import { reviews } from "../../data/store.js";
import { findById } from "../../data/helpers.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ count: reviews.length, data: reviews });
});

// GET /api/reviews/:reviewId (numbers only)
router.get(/^\/(\d+)$/, (req, res) => {
  const reviewId = getReviewId(req);
  const review = findById(reviews, reviewId);
  if (!review) return res.status(404).json({ error: "Review not found" });
  res.json(review);
});

function getReviewId(req) {
  return req.params.reviewId ?? req.params[0];
}

export default router;
