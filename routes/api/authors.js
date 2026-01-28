import { Router } from "express";
import { authors } from "../../data/store.js";
import { findById, newId, validateNewAuthor } from "../../data/helpers.js";
import { createHttpError } from "../../utils/httpError.js";

const router = Router();

router.param("authorId", (req, res, next, value) => {
  if (!/^\d+$/.test(String(value))) {
    return next(createHttpError(404, "Author not found", { code: "NOT_FOUND" }));
  }
  next();
});

router.get("/", (req, res) => {
  res.json({ count: authors.length, data: authors });
});

// POST /api/authors (optional, but helpful for creating new authors in the UI)
router.post("/", (req, res, next) => {
  const validated = validateNewAuthor(req.body || {});
  if (!validated.ok) {
    return next(
      createHttpError(400, "Validation failed", {
        code: "VALIDATION_ERROR",
        details: validated.errors,
      })
    );
  }

  const author = { id: newId(authors), name: validated.value.name };
  authors.push(author);

  // If a browser submitted the form, redirect back to the books page.
  if (req.is("application/x-www-form-urlencoded") || req.accepts("html")) {
    return res.redirect(303, "/books");
  }

  res.status(201).json(author);
});

// GET /api/authors/:authorId (numbers only)
router.get("/:authorId", (req, res, next) => {
  const authorId = getAuthorId(req);
  const author = findById(authors, authorId);
  if (!author) return next(createHttpError(404, "Author not found", { code: "NOT_FOUND" }));
  res.json(author);
});

// PATCH /api/authors/:authorId (rename author, numbers only)
router.patch("/:authorId", (req, res, next) => {
  const authorId = getAuthorId(req);
  const author = findById(authors, authorId);
  if (!author) return next(createHttpError(404, "Author not found", { code: "NOT_FOUND" }));

  const name = String(req.body?.name || "").trim();
  if (!name) {
    return next(
      createHttpError(400, "Validation failed", {
        code: "VALIDATION_ERROR",
        details: ["name cannot be empty"],
      })
    );
  }

  author.name = name;
  res.json(author);
});

function getAuthorId(req) {
  return req.params.authorId;
}

export default router;
