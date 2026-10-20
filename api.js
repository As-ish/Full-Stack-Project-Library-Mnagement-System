// Copy this file to your React app (e.g. src/api.js)
// For Vite set VITE_API_URL in .env, otherwise it defaults to localhost:5000
const BASE = (import.meta.env?.VITE_API_URL) || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  dashboard: () => request("/dashboard"),

  getBooks: (q = "", genre = "All") =>
    request(`/books?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}`),
  addBook: (book) => request("/books", { method: "POST", body: book }),
  updateBook: (id, book) => request(`/books/${id}`, { method: "PUT", body: book }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  getMembers: () => request("/members"),
  addMember: (m) => request("/members", { method: "POST", body: m }),
  updateMember: (id, m) => request(`/members/${id}`, { method: "PUT", body: m }),
  deleteMember: (id) => request(`/members/${id}`, { method: "DELETE" }),

  getActiveIssues: () => request("/issues?status=active"),
  issueBook: (bookId, memberId) => request("/issues", { method: "POST", body: { bookId, memberId } }),
  returnBook: (issueId) => request(`/issues/${issueId}/return`, { method: "POST" }),
};

/* ---- Example usage inside App.jsx ----
useEffect(() => {
  Promise.all([api.getBooks(), api.getMembers(), api.getActiveIssues()])
    .then(([b, m, i]) => { setBooks(b); setMembers(m); setIssues(i); });
}, []);

const saveBook = async (data) => {
  try {
    const saved = data.id ? await api.updateBook(data.id, data) : await api.addBook(data);
    setBooks(prev => data.id ? prev.map(b => b.id === saved.id ? saved : b) : [...prev, saved]);
    showToast(data.id ? "Book details updated" : "New title catalogued");
    setBookForm(null);
  } catch (e) { showToast(e.message); }
};
*/
