import express from "express";
import healthRoutes from "./routes/health.js";
import booksApiRoutes from "./routes/api/books.js";
import authorsApiRoutes from "./routes/api/authors.js";
import reviewsApiRoutes from "./routes/api/reviews.js";
import booksViewRoutes from "./routes/views/books.js";
import authorsViewRoutes from "./routes/views/authors.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import requestId from "./middleware/requestId.js";
import logger from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

// View engine (EJS)
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Custom middleware
app.use(requestId);
app.use(logger);

// Parse JSON + form bodies (so req.body works)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/health", healthRoutes);
app.get("/", (req, res) => {
  res.redirect(303, "/books");
});
app.use("/api/books", booksApiRoutes);
app.use("/api/authors", authorsApiRoutes);
app.use("/api/reviews", reviewsApiRoutes);
app.use("/books", booksViewRoutes);
app.use("/authors", authorsViewRoutes);

// 404 handler (must be AFTER routes)
app.use(notFound);

// Error handler (must be LAST)
app.use(errorHandler);

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || "development";
  console.log(`Server running on http://localhost:${PORT} (${env})`);
});
