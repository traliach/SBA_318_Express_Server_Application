export const authors = [
  { id: 1, name: "Jane Austen" },
  { id: 2, name: "George Orwell" },
];

export const books = [
  { id: 1, title: "Pride and Prejudice", authorId: 1, genre: "classic", year: 1813, createdAt: new Date().toISOString() },
  { id: 2, title: "1984", authorId: 2, genre: "dystopian", year: 1949, createdAt: new Date().toISOString() },
];

export const reviews = [
  { id: 1, bookId: 2, rating: 5, text: "A classic warning." },
];
