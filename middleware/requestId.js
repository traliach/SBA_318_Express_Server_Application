import crypto from "node:crypto";

export default function requestId(req, res, next) {
  // 12 hex chars is enough for student projects.
  const id = crypto.randomBytes(6).toString("hex");
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
