import { Router } from "express";
import { authors, books } from "../../data/store.js";

const router = Router();

router.get("/", (req, res) => {
  const authorById = new Map(authors.map((a) => [a.id, a.name]));
  const rows = books.map((b) => ({
    ...b,
    authorName: authorById.get(b.authorId) || "Unknown",
  }));

  res.render("books", { books: rows, authors });
});

// Two-step form action (so we can "DELETE" from an HTML form)
router.post("/:bookId/delete", (req, res) => {
  const id = Number(req.params.bookId);
  const idx = books.findIndex((b) => Number(b.id) === id);

  if (idx === -1) {
    return res.status(404).render("error", { status: 404, message: "Book not found" });
  }

  books.splice(idx, 1);
  res.redirect(303, "/books");
});

export default router;
