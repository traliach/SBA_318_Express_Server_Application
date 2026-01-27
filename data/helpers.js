export function newId(items) {
  const max = items.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
  return max + 1;
}

export function findById(items, id) {
  const num = Number(id);
  return items.find((x) => Number(x.id) === num);
}

export function filterBooks(allBooks, query) {
  let out = [...allBooks];

  if (query.genre) {
    out = out.filter((b) => String(b.genre).toLowerCase() === String(query.genre).toLowerCase());
  }

  if (query.authorId) {
    const authorId = Number(query.authorId);
    out = out.filter((b) => Number(b.authorId) === authorId);
  }

  if (query.q) {
    const q = String(query.q).toLowerCase();
    out = out.filter((b) => String(b.title).toLowerCase().includes(q));
  }

  return out;
}

export function validateNewBook(payload) {
  const errors = [];

  const title = String(payload.title || "").trim();
  if (!title) errors.push("title is required");

  const authorId = Number(payload.authorId);
  if (!authorId || Number.isNaN(authorId)) errors.push("authorId is required");

  const yearRaw = payload.year;
  const year = yearRaw === "" || yearRaw == null ? undefined : Number(yearRaw);
  if (year !== undefined && (Number.isNaN(year) || year < 0)) errors.push("year must be a valid number");

  const genre = String(payload.genre || "").trim();

  return {
    ok: errors.length === 0,
    errors,
    value: { title, authorId, genre: genre || "unknown", year },
  };
}

export function validateBookPatch(payload) {
  const errors = [];

  // Only validate fields that were provided.
  const out = {};

  if (payload.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) errors.push("title cannot be empty");
    else out.title = title;
  }

  if (payload.authorId !== undefined) {
    const authorId = Number(payload.authorId);
    if (!authorId || Number.isNaN(authorId)) errors.push("authorId must be a valid number");
    else out.authorId = authorId;
  }

  if (payload.genre !== undefined) {
    const genre = String(payload.genre || "").trim();
    out.genre = genre || "unknown";
  }

  if (payload.year !== undefined) {
    const yearRaw = payload.year;
    const year = yearRaw === "" || yearRaw == null ? undefined : Number(yearRaw);
    if (year !== undefined && (Number.isNaN(year) || year < 0)) errors.push("year must be a valid number");
    else out.year = year;
  }

  return { ok: errors.length === 0, errors, value: out };
}

export function validateNewAuthor(payload) {
  const errors = [];
  const name = String(payload.name || "").trim();
  if (!name) errors.push("name is required");

  return { ok: errors.length === 0, errors, value: { name } };
}

export function validateAuthorPatch(payload) {
  const errors = [];
  const out = {};

  if (payload.name !== undefined) {
    const name = String(payload.name || "").trim();
    if (!name) errors.push("name cannot be empty");
    else out.name = name;
  }

  return { ok: errors.length === 0, errors, value: out };
}
