import { Router } from "express";
import { authors, books } from "../../data/store.js";
import { filterBooks, findById, newId, validateBookPatch, validateNewBook } from "../../data/helpers.js";

const router = Router();

// GET /api/books?genre=&authorId=&q=
router.get("/", (req, res) => {
  const results = filterBooks(books, req.query);
  res.json({ count: results.length, data: results });
});

// GET /api/books/:bookId
router.get("/:bookId", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// POST /api/books (used by the form on /books)
router.post("/", (req, res) => {
  const validated = validateNewBook(req.body || {});
  if (!validated.ok) {
    return res.status(400).json({ error: "Validation failed", details: validated.errors });
  }

  const author = findById(authors, validated.value.authorId);
  if (!author) return res.status(400).json({ error: "authorId does not exist" });

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

// PATCH /api/books/:bookId (edit book)
router.patch("/:bookId", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).json({ error: "Book not found" });

  const validated = validateBookPatch(req.body || {});
  if (!validated.ok) {
    return res.status(400).json({ error: "Validation failed", details: validated.errors });
  }

  if (validated.value.authorId !== undefined) {
    const author = findById(authors, validated.value.authorId);
    if (!author) return res.status(400).json({ error: "authorId does not exist" });
  }

  Object.assign(book, validated.value);
  res.json(book);
});

// DELETE /api/books/:bookId
router.delete("/:bookId", (req, res) => {
  const idx = books.findIndex((b) => Number(b.id) === Number(req.params.bookId));
  if (idx === -1) return res.status(404).json({ error: "Book not found" });

  const deleted = books.splice(idx, 1)[0];
  res.json(deleted);
});

export default router;
