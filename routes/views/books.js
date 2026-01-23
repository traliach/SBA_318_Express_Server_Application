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

export default router;
