import { Router } from "express";
import { reviews } from "../../data/store.js";
import { findById } from "../../data/helpers.js";
import { createHttpError } from "../../utils/httpError.js";

const router = Router();

router.param("reviewId", (req, res, next, value) => {
  if (!/^\d+$/.test(String(value))) {
    return next(createHttpError(404, "Review not found", { code: "NOT_FOUND" }));
  }
  next();
});

router.get("/", (req, res) => {
  res.json({ count: reviews.length, data: reviews });
});

// GET /api/reviews/:reviewId (numbers only)
router.get("/:reviewId", (req, res, next) => {
  const reviewId = getReviewId(req);
  const review = findById(reviews, reviewId);
  if (!review) return next(createHttpError(404, "Review not found", { code: "NOT_FOUND" }));
  res.json(review);
});

function getReviewId(req) {
  return req.params.reviewId;
}

export default router;
