import { Router } from "express";
import { authors, books } from "../../data/store.js";
import { filterBooks, findById, newId, validateNewBook } from "../../data/helpers.js";

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
  res.status(201).json(book);
});

export default router;
