export default function notFound(req, res, next) {
  // API routes return JSON; view routes render a page.
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
  }

  res.status(404).render("error", { status: 404, message: "Page not found" });
}
