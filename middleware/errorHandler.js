export default function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Server error";
  const code = err.code;
  const details = err.details;

  // Log errors in development for debugging.
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack || err.message);
  }

  // API routes return JSON; view routes render a page.
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(status).json({
      error: {
        message,
        ...(code ? { code } : {}),
        ...(details ? { details } : {}),
      },
    });
  }

  res.status(status).render("error", { status, message });
}
