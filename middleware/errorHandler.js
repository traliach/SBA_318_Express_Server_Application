export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Server error";

  // API routes return JSON; view routes render a page.
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(status).json({ error: message });
  }

  res.status(status).render("error", { status, message });
}
