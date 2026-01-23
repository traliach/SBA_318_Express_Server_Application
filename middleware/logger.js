export default function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const idPart = req.id ? ` id=${req.id}` : "";
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms${idPart}`);
  });

  next();
}
