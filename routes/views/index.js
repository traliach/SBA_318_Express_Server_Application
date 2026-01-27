import { Router } from "express";
import { authors, books } from "../../data/store.js";
import { findById } from "../../data/helpers.js";

const router = Router();

// Books page
router.get("/books", (req, res) => {
  const authorById = new Map(authors.map((a) => [a.id, a.name]));
  const rows = books.map((b) => ({
    ...b,
    authorName: authorById.get(b.authorId) || "Unknown",
  }));

  res.render("books", { books: rows, authors });
});

// Two-step delete (HTML forms can't send DELETE)
router.post("/books/:bookId/delete", (req, res) => {
  const id = Number(req.params.bookId);
  const idx = books.findIndex((b) => Number(b.id) === id);
  if (idx === -1) {
    return res.status(404).render("error", { status: 404, message: "Book not found" });
  }

  books.splice(idx, 1);
  res.redirect(303, "/books");
});

router.get("/books/:bookId/edit", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).render("error", { status: 404, message: "Book not found" });
  res.render("editBook", { book, authors });
});

// Two-step edit (HTML forms can't send PATCH)
router.post("/books/:bookId/edit", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).render("error", { status: 404, message: "Book not found" });

  const payload = { ...req.body };
  for (const key of ["title", "authorId", "genre", "year"]) {
    if (payload[key] === "") delete payload[key];
  }

  const patch = buildBookPatch(payload);
  if (!patch.ok) {
    return res.status(400).render("editBook", {
      book,
      authors,
      error: patch.errors.join(", "),
    });
  }

  if (patch.value.authorId !== undefined) {
    const author = findById(authors, patch.value.authorId);
    if (!author) {
      return res.status(400).render("editBook", {
        book,
        authors,
        error: "authorId does not exist",
      });
    }
  }

  Object.assign(book, patch.value);
  res.redirect(303, "/books");
});

// Authors page (rename/delete only)
router.get("/authors", (req, res) => {
  res.render("authors", { authors, error: null });
});

router.post("/authors/:authorId/edit", (req, res) => {
  const author = findById(authors, req.params.authorId);
  if (!author) return res.status(404).render("error", { status: 404, message: "Author not found" });

  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).render("authors", { authors, error: "name cannot be empty" });
  }

  author.name = name;
  res.redirect(303, "/authors");
});

router.post("/authors/:authorId/delete", (req, res) => {
  const id = Number(req.params.authorId);
  const hasBooks = books.some((b) => Number(b.authorId) === id);
  if (hasBooks) {
    return res.status(400).render("authors", {
      authors,
      error: "Cannot delete an author while books still reference them.",
    });
  }

  const idx = authors.findIndex((a) => Number(a.id) === id);
  if (idx === -1) return res.status(404).render("error", { status: 404, message: "Author not found" });

  authors.splice(idx, 1);
  res.redirect(303, "/authors");
});

function buildBookPatch(payload) {
  const errors = [];
  const out = {};

  if (payload.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) errors.push("title cannot be empty");
    else out.title = title;
  }

  if (payload.authorId !== undefined) {
    const authorId = Number(payload.authorId);
    if (!authorId || Number.isNaN(authorId)) errors.push("authorId must be a valid number");
    else out.authorId = authorId;
  }

  if (payload.genre !== undefined) {
    const genre = String(payload.genre || "").trim();
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

export default router;
