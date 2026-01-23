import { Router } from "express";
import { authors } from "../../data/store.js";
import { findById } from "../../data/helpers.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ count: authors.length, data: authors });
});

router.get("/:authorId", (req, res) => {
  const author = findById(authors, req.params.authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });
  res.json(author);
});

export default router;
