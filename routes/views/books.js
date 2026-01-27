import { Router } from "express";
import { authors, books } from "../../data/store.js";
import { findById, validateBookPatch } from "../../data/helpers.js";

const router = Router();

// Render the main Books page
router.get("/", (req, res) => {
  const authorById = new Map(authors.map((a) => [a.id, a.name]));
  const rows = books.map((b) => ({
    ...b,
    authorName: authorById.get(b.authorId) || "Unknown",
  }));

  res.render("books", { books: rows, authors });
});

// Two-step form action (HTML forms can't send DELETE)
router.post("/:bookId/delete", (req, res) => {
  const id = Number(req.params.bookId);
  const idx = books.findIndex((b) => Number(b.id) === id);

  if (idx === -1) {
    return res.status(404).render("error", { status: 404, message: "Book not found" });
  }

  books.splice(idx, 1);
  res.redirect(303, "/books");
});

router.get("/:bookId/edit", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).render("error", { status: 404, message: "Book not found" });
  res.render("editBook", { book, authors });
});

// Two-step form action (HTML forms can't send PATCH)
router.post("/:bookId/edit", (req, res) => {
  const book = findById(books, req.params.bookId);
  if (!book) return res.status(404).render("error", { status: 404, message: "Book not found" });

  // Convert empty strings to "not provided" so patch validation works.
  const payload = { ...req.body };
  for (const key of ["title", "authorId", "genre", "year"]) {
    if (payload[key] === "") delete payload[key];
  }

  const validated = validateBookPatch(payload);
  if (!validated.ok) {
    return res.status(400).render("editBook", {
      book,
      authors,
      error: validated.errors.join(", "),
    });
  }

  if (validated.value.authorId !== undefined) {
    const author = findById(authors, validated.value.authorId);
    if (!author) {
      return res.status(400).render("editBook", {
        book,
        authors,
        error: "authorId does not exist",
      });
    }
  }

  Object.assign(book, validated.value);
  res.redirect(303, "/books");
});

export default router;
