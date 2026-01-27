import { Router } from "express";
import { authors, books } from "../../data/store.js";
import { findById, newId, validateAuthorPatch, validateNewAuthor } from "../../data/helpers.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("authors", { authors, error: null });
});

router.post("/", (req, res) => {
  const validated = validateNewAuthor(req.body || {});
  if (!validated.ok) {
    return res.status(400).render("authors", { authors, error: validated.errors.join(", ") });
  }

  const author = { id: newId(authors), name: validated.value.name };
  authors.push(author);
  res.redirect(303, "/authors");
});

router.post("/:authorId/edit", (req, res) => {
  const author = findById(authors, req.params.authorId);
  if (!author) return res.status(404).render("error", { status: 404, message: "Author not found" });

  const validated = validateAuthorPatch(req.body || {});
  if (!validated.ok) {
    return res.status(400).render("authors", { authors, error: validated.errors.join(", ") });
  }

  Object.assign(author, validated.value);
  res.redirect(303, "/authors");
});

router.post("/:authorId/delete", (req, res) => {
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

export default router;
