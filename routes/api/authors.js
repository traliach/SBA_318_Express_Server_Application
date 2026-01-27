import { Router } from "express";
import { authors } from "../../data/store.js";
import { findById, newId, validateAuthorPatch, validateNewAuthor } from "../../data/helpers.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ count: authors.length, data: authors });
});

// POST /api/authors (optional, but helpful for creating new authors in the UI)
router.post("/", (req, res) => {
  const validated = validateNewAuthor(req.body || {});
  if (!validated.ok) {
    return res.status(400).json({ error: "Validation failed", details: validated.errors });
  }

  const author = { id: newId(authors), name: validated.value.name };
  authors.push(author);

  // If a browser submitted the form, redirect back to the books page.
  if (req.is("application/x-www-form-urlencoded") || req.accepts("html")) {
    return res.redirect(303, "/books");
  }

  res.status(201).json(author);
});

router.get("/:authorId", (req, res) => {
  const author = findById(authors, req.params.authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });
  res.json(author);
});

// PATCH /api/authors/:authorId (rename author)
router.patch("/:authorId", (req, res) => {
  const author = findById(authors, req.params.authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });

  const validated = validateAuthorPatch(req.body || {});
  if (!validated.ok) {
    return res.status(400).json({ error: "Validation failed", details: validated.errors });
  }

  Object.assign(author, validated.value);
  res.json(author);
});

export default router;
