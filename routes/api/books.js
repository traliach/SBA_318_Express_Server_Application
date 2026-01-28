import { Router } from "express";
import sanitizeHtml from "sanitize-html";
import { authors, books } from "../../data/store.js";
import { filterBooks, findById, newId, validateNewBook } from "../../data/helpers.js";
import { createHttpError } from "../../utils/httpError.js";

const router = Router();

// Enforce numeric IDs for REST-style param routes.
router.param("bookId", (req, res, next, value) => {
  if (!/^\d+$/.test(String(value))) {
    return next(createHttpError(404, "Book not found", { code: "NOT_FOUND" }));
  }
  next();
});

// GET /api/books?genre=&authorId=&q=
router.get("/", (req, res) => {
  const results = filterBooks(books, req.query);
  res.json({ count: results.length, data: results });
});

// GET /api/books/:bookId (numbers only)
router.get("/:bookId", (req, res, next) => {
  const bookId = getBookId(req);
  const book = findById(books, bookId);
  if (!book) return next(createHttpError(404, "Book not found", { code: "NOT_FOUND" }));
  res.json(book);
});

// POST /api/books (used by the form on /books)
router.post("/", (req, res, next) => {
  const body = req.body || {};
  const sanitized = {
    ...body,
    title: cleanText(body.title),
    genre: cleanText(body.genre),
  };
  const validated = validateNewBook(sanitized);
  if (!validated.ok) {
    return next(
      createHttpError(400, "Validation failed", {
        code: "VALIDATION_ERROR",
        details: validated.errors,
      })
    );
  }

  const author = findById(authors, validated.value.authorId);
  if (!author) {
    return next(
      createHttpError(400, "authorId does not exist", {
        code: "VALIDATION_ERROR",
      })
    );
  }

  const book = {
    id: newId(books),
    title: validated.value.title,
    authorId: validated.value.authorId,
    genre: validated.value.genre,
    year: validated.value.year,
    createdAt: new Date().toISOString(),
  };

  books.push(book);

  // If a browser submitted the form, redirect back to the page.
  // API clients (curl/Postman) still get JSON.
  if (req.is("application/x-www-form-urlencoded") || req.accepts("html")) {
    return res.redirect(303, "/books");
  }

  res.status(201).json(book);
});

// PATCH /api/books/:bookId (edit book, numbers only)
router.patch("/:bookId", (req, res, next) => {
  const bookId = getBookId(req);
  const book = findById(books, bookId);
  if (!book) return next(createHttpError(404, "Book not found", { code: "NOT_FOUND" }));

  const patch = buildBookPatch(req.body || {});
  if (!patch.ok) {
    return next(
      createHttpError(400, "Validation failed", {
        code: "VALIDATION_ERROR",
        details: patch.errors,
      })
    );
  }

  if (patch.value.authorId !== undefined) {
    const author = findById(authors, patch.value.authorId);
    if (!author) {
      return next(
        createHttpError(400, "authorId does not exist", {
          code: "VALIDATION_ERROR",
        })
      );
    }
  }

  Object.assign(book, patch.value);
  res.json(book);
});

function buildBookPatch(payload) {
  const errors = [];
  const out = {};

  if (payload.title !== undefined) {
    const title = cleanText(payload.title);
    if (!title) errors.push("title cannot be empty");
    else out.title = title;
  }

  if (payload.authorId !== undefined) {
    const authorId = Number(payload.authorId);
    if (!authorId || Number.isNaN(authorId)) errors.push("authorId must be a valid number");
    else out.authorId = authorId;
  }

  if (payload.genre !== undefined) {
    const genre = cleanText(payload.genre);
    out.genre = genre || "unknown";
  }

  if (payload.year !== undefined) {
    const yearRaw = payload.year;
    const year = yearRaw === "" || yearRaw == null ? undefined : Number(yearRaw);
    if (year !== undefined && (Number.isNaN(year) || year < 0)) errors.push("year must be a valid number");
    else out.year = year;
  }

  return { ok: errors.length === 0, errors, value: out };
}

function cleanText(value) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

// DELETE /api/books/:bookId (numbers only)
router.delete("/:bookId", (req, res, next) => {
  const bookId = getBookId(req);
  const idx = books.findIndex((b) => Number(b.id) === Number(bookId));
  if (idx === -1) return next(createHttpError(404, "Book not found", { code: "NOT_FOUND" }));

  const deleted = books.splice(idx, 1)[0];
  res.json(deleted);
});

function getBookId(req) {
  return req.params.bookId;
}

export default router;
