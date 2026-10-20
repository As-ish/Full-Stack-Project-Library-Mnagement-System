import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Users,
  RefreshCw,
  LayoutGrid,
  Search,
  Plus,
  X,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Stamp,
} from "lucide-react";

// ---------- Seed data ----------
const seedBooks = [
  { id: "B-101", title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", isbn: "978-0525559474", copies: 3, available: 1 },
  { id: "B-102", title: "Sapiens", author: "Yuval Noah Harari", genre: "History", isbn: "978-0062316097", copies: 2, available: 0 },
  { id: "B-103", title: "Atomic Habits", author: "James Clear", genre: "Self-Help", isbn: "978-0735211292", copies: 4, available: 3 },
  { id: "B-104", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", isbn: "978-0441172719", copies: 2, available: 1 },
  { id: "B-105", title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", isbn: "978-1250301697", copies: 3, available: 3 },
  { id: "B-106", title: "Educated", author: "Tara Westover", genre: "Memoir", isbn: "978-0399590504", copies: 2, available: 1 },
  { id: "B-107", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", isbn: "978-0553380163", copies: 2, available: 2 },
  { id: "B-108", title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", isbn: "978-0062315007", copies: 5, available: 4 },
];

const seedMembers = [
  { id: "M-01", name: "Ananya Sharma", email: "ananya.sharma@mail.com", phone: "98765 43210", joined: "2024-02-11" },
  { id: "M-02", name: "Rohit Verma", email: "rohit.verma@mail.com", phone: "91234 56780", joined: "2024-06-20" },
  { id: "M-03", name: "Kabir Malhotra", email: "kabir.m@mail.com", phone: "99887 66554", joined: "2023-11-02" },
  { id: "M-04", name: "Sneha Iyer", email: "sneha.iyer@mail.com", phone: "90011 22334", joined: "2025-01-15" },
];

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

const seedIssues = [
  { id: "R-1001", bookId: "B-102", memberId: "M-01", issueDate: iso(addDays(today, -20)), dueDate: iso(addDays(today, -6)), returnDate: null },
  { id: "R-1002", bookId: "B-102", memberId: "M-03", issueDate: iso(addDays(today, -12)), dueDate: iso(addDays(today, 2)), returnDate: null },
  { id: "R-1003", bookId: "B-101", memberId: "M-02", issueDate: iso(addDays(today, -5)), dueDate: iso(addDays(today, 9)), returnDate: null },
  { id: "R-1004", bookId: "B-104", memberId: "M-04", issueDate: iso(addDays(today, -3)), dueDate: iso(addDays(today, 11)), returnDate: null },
  { id: "R-1005", bookId: "B-106", memberId: "M-01", issueDate: iso(addDays(today, -30)), dueDate: iso(addDays(today, -16)), returnDate: iso(addDays(today, -18)) },
  { id: "R-1006", bookId: "B-108", memberId: "M-03", issueDate: iso(addDays(today, -2)), dueDate: iso(addDays(today, 12)), returnDate: null },
];

let bookSeq = 109;
let memberSeq = 5;
let issueSeq = 1007;

const GENRES = ["Fiction", "Non-Fiction", "History", "Self-Help", "Sci-Fi", "Thriller", "Memoir", "Science", "Biography", "Poetry"];

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

export default function LibraryManagementSystem() {
  const [books, setBooks] = useState(seedBooks);
  const [members, setMembers] = useState(seedMembers);
  const [issues, setIssues] = useState(seedIssues);
  const [tab, setTab] = useState("dashboard");

  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  const [bookForm, setBookForm] = useState(null); // null | {} | book
  const [memberForm, setMemberForm] = useState(null);
  const [issueForm, setIssueForm] = useState({ bookId: "", memberId: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const activeIssues = issues.filter((r) => !r.returnDate);

  const stats = useMemo(() => {
    const totalCopies = books.reduce((s, b) => s + b.copies, 0);
    const availableCopies = books.reduce((s, b) => s + b.available, 0);
    const overdue = activeIssues.filter((r) => daysBetween(r.dueDate, iso(today)) > 0).length;
    return {
      titles: books.length,
      totalCopies,
      availableCopies,
      issuedCopies: totalCopies - availableCopies,
      members: members.length,
      overdue,
    };
  }, [books, members, activeIssues]);

  const filteredBooks = books.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase()) ||
      b.isbn.includes(query);
    const matchesGenre = genreFilter === "All" || b.genre === genreFilter;
    return matchesQuery && matchesGenre;
  });

  // ---------- Book CRUD ----------
  const saveBook = (data) => {
    if (data.id) {
      setBooks((prev) => prev.map((b) => (b.id === data.id ? { ...data } : b)));
      showToast("Book details updated");
    } else {
      const id = `B-${bookSeq++}`;
      const copies = Number(data.copies) || 1;
      setBooks((prev) => [...prev, { ...data, id, copies, available: copies }]);
      showToast("New title catalogued");
    }
    setBookForm(null);
  };

  const deleteBook = (id) => {
    if (activeIssues.some((r) => r.bookId === id)) {
      showToast("Can't remove — a copy is still on loan");
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast("Title removed from catalogue");
  };

  // ---------- Member CRUD ----------
  const saveMember = (data) => {
    if (data.id) {
      setMembers((prev) => prev.map((m) => (m.id === data.id ? { ...data } : m)));
      showToast("Member details updated");
    } else {
      const id = `M-${String(memberSeq++).padStart(2, "0")}`;
      setMembers((prev) => [...prev, { ...data, id, joined: iso(today) }]);
      showToast("New member enrolled");
    }
    setMemberForm(null);
  };

  const deleteMember = (id) => {
    if (activeIssues.some((r) => r.memberId === id)) {
      showToast("Can't remove — member has a book on loan");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast("Member removed");
  };

  // ---------- Circulation ----------
  const issueBook = () => {
    const { bookId, memberId } = issueForm;
    if (!bookId || !memberId) return;
    const book = books.find((b) => b.id === bookId);
    if (!book || book.available < 1) {
      showToast("No copies available to issue");
      return;
    }
    const id = `R-${issueSeq++}`;
    setIssues((prev) => [
      ...prev,
      { id, bookId, memberId, issueDate: iso(today), dueDate: iso(addDays(today, 14)), returnDate: null },
    ]);
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, available: b.available - 1 } : b)));
    setIssueForm({ bookId: "", memberId: "" });
    showToast("Book issued");
  };

  const returnBook = (recordId) => {
    const record = issues.find((r) => r.id === recordId);
    if (!record) return;
    setIssues((prev) => prev.map((r) => (r.id === recordId ? { ...r, returnDate: iso(today) } : r)));
    setBooks((prev) => prev.map((b) => (b.id === record.bookId ? { ...b, available: b.available + 1 } : b)));
    showToast("Return recorded");
  };

  const bookById = (id) => books.find((b) => b.id === id);
  const memberById = (id) => members.find((m) => m.id === id);

  return (
    <div className="min-h-screen w-full" style={{ background: "#EFE6D3", fontFamily: "'Inter', sans-serif", color: "#241F1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        .serif { font-family: 'Fraunces', serif; }
        .card-catalog {
          background: #FBF6EA;
          border: 1px solid #D9CBA6;
          box-shadow: 2px 3px 0 #D9CBA6;
        }
        .stamp {
          font-family: 'Fraunces', serif;
          letter-spacing: 0.06em;
          transform: rotate(-3deg);
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #C9B98C; border-radius: 4px; }
      `}</style>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 hidden sm:flex flex-col justify-between" style={{ background: "#1F3A2E" }}>
          <div>
            <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: "#2E5240" }}>
              <div className="flex items-center gap-2 text-[#F2E8D5]">
                <BookOpen size={22} />
                <span className="serif text-lg leading-tight">The Reading Room</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: "#9CB6A5" }}>Circulation Desk</p>
            </div>
            <nav className="px-3 py-5 flex flex-col gap-1">
              {[
                { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
                { key: "books", label: "Catalogue", icon: BookOpen },
                { key: "members", label: "Members", icon: Users },
                { key: "circulation", label: "Issue / Return", icon: RefreshCw },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors"
                    style={{
                      background: isActive ? "#F2E8D5" : "transparent",
                      color: isActive ? "#1F3A2E" : "#D9E4DB",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="px-6 py-5 text-[11px]" style={{ color: "#7E9A89" }}>
            {stats.overdue > 0 ? `${stats.overdue} overdue return${stats.overdue > 1 ? "s" : ""}` : "All returns on schedule"}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-5 sm:px-10 py-8 max-w-[1180px]">
          {/* Mobile tab bar */}
          <div className="sm:hidden flex gap-2 mb-6 overflow-x-auto">
            {["dashboard", "books", "members", "circulation"].map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="px-3 py-1.5 rounded-sm text-xs whitespace-nowrap capitalize"
                style={{ background: tab === k ? "#1F3A2E" : "#E4D8B8", color: tab === k ? "#F2E8D5" : "#1F3A2E" }}
              >
                {k}
              </button>
            ))}
          </div>

          {tab === "dashboard" && (
            <Dashboard stats={stats} books={books} members={members} activeIssues={activeIssues} bookById={bookById} memberById={memberById} />
          )}

          {tab === "books" && (
            <BooksView
              books={filteredBooks}
              query={query}
              setQuery={setQuery}
              genreFilter={genreFilter}
              setGenreFilter={setGenreFilter}
              onAdd={() => setBookForm({})}
              onEdit={(b) => setBookForm(b)}
              onDelete={deleteBook}
            />
          )}

          {tab === "members" && (
            <MembersView
              members={members}
              activeIssues={activeIssues}
              onAdd={() => setMemberForm({})}
              onEdit={(m) => setMemberForm(m)}
              onDelete={deleteMember}
            />
          )}

          {tab === "circulation" && (
            <CirculationView
              books={books}
              members={members}
              activeIssues={activeIssues}
              issueForm={issueForm}
              setIssueForm={setIssueForm}
              onIssue={issueBook}
              onReturn={returnBook}
              bookById={bookById}
              memberById={memberById}
            />
          )}
        </main>
      </div>

      {bookForm !== null && <BookFormModal data={bookForm} onSave={saveBook} onClose={() => setBookForm(null)} />}
      {memberForm !== null && <MemberFormModal data={memberForm} onSave={saveMember} onClose={() => setMemberForm(null)} />}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-sm text-sm shadow-lg z-50"
          style={{ background: "#1F3A2E", color: "#F2E8D5" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ================= Dashboard =================
function Dashboard({ stats, books, activeIssues, bookById, memberById }) {
  const cards = [
    { label: "Titles catalogued", value: stats.titles, color: "#1F3A2E" },
    { label: "Copies on shelf", value: stats.availableCopies, color: "#4C6B57" },
    { label: "Copies on loan", value: stats.issuedCopies, color: "#A9793D" },
    { label: "Members enrolled", value: stats.members, color: "#5A5145" },
  ];
  const recent = [...activeIssues].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 6);

  return (
    <div>
      <header className="mb-7">
        <h1 className="serif text-3xl" style={{ color: "#1F3A2E" }}>Front Desk</h1>
        <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>A quick look at what's on the shelves and what's out on loan.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card-catalog rounded-sm p-4">
            <p className="serif text-3xl" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: "#6B5F4F" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {stats.overdue > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-sm mb-8 text-sm" style={{ background: "#F3D9D3", color: "#7A2E24" }}>
          <AlertTriangle size={16} />
          {stats.overdue} loan{stats.overdue > 1 ? "s are" : " is"} past the due date — check the Issue / Return desk.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-catalog rounded-sm p-5">
          <h2 className="serif text-lg mb-3" style={{ color: "#1F3A2E" }}>Recent loans</h2>
          <div className="flex flex-col divide-y" style={{ borderColor: "#E4D8B8" }}>
            {recent.map((r) => {
              const overdue = daysBetween(r.dueDate, iso(today)) > 0;
              return (
                <div key={r.id} className="flex items-center justify-between py-2.5 text-sm" style={{ borderColor: "#E4D8B8" }}>
                  <div>
                    <p className="font-medium">{bookById(r.bookId)?.title}</p>
                    <p className="text-xs" style={{ color: "#8A7C64" }}>{memberById(r.memberId)?.name}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{ background: overdue ? "#F3D9D3" : "#DEE9DF", color: overdue ? "#7A2E24" : "#2F513E" }}
                  >
                    {overdue ? "Overdue" : `Due ${r.dueDate}`}
                  </span>
                </div>
              );
            })}
            {recent.length === 0 && <p className="text-sm py-3" style={{ color: "#8A7C64" }}>No active loans right now.</p>}
          </div>
        </div>

        <div className="card-catalog rounded-sm p-5">
          <h2 className="serif text-lg mb-3" style={{ color: "#1F3A2E" }}>Genres on the shelf</h2>
          <div className="flex flex-col gap-2.5">
            {Object.entries(
              books.reduce((acc, b) => {
                acc[b.genre] = (acc[b.genre] || 0) + 1;
                return acc;
              }, {})
            ).map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0" style={{ color: "#6B5F4F" }}>{genre}</span>
                <div className="flex-1 h-2 rounded-sm" style={{ background: "#E4D8B8" }}>
                  <div className="h-2 rounded-sm" style={{ width: `${(count / books.length) * 100}%`, background: "#A9793D" }} />
                </div>
                <span className="w-4 text-right text-xs" style={{ color: "#8A7C64" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= Books =================
function BooksView({ books, query, setQuery, genreFilter, setGenreFilter, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="serif text-3xl" style={{ color: "#1F3A2E" }}>Catalogue</h1>
          <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>{books.length} title{books.length !== 1 ? "s" : ""} shown</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium"
          style={{ background: "#1F3A2E", color: "#F2E8D5" }}
        >
          <Plus size={16} /> Add a book
        </button>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[220px]" style={{ background: "#FBF6EA", border: "1px solid #D9CBA6" }}>
          <Search size={15} style={{ color: "#8A7C64" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="px-3 py-2 rounded-sm text-sm outline-none"
          style={{ background: "#FBF6EA", border: "1px solid #D9CBA6", color: "#241F1A" }}
        >
          <option>All</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b) => (
          <div key={b.id} className="card-catalog rounded-sm p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="serif text-lg leading-snug" style={{ color: "#1F3A2E" }}>{b.title}</h3>
                <span
                  className="text-[10px] px-2 py-1 rounded-sm shrink-0"
                  style={{ background: b.available > 0 ? "#DEE9DF" : "#F3D9D3", color: b.available > 0 ? "#2F513E" : "#7A2E24" }}
                >
                  {b.available > 0 ? "Available" : "All on loan"}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>{b.author}</p>
              <p className="text-xs mt-2" style={{ color: "#8A7C64" }}>{b.genre} · ISBN {b.isbn}</p>
              <p className="text-xs mt-1" style={{ color: "#8A7C64" }}>{b.available} of {b.copies} copies on shelf</p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: "#E4D8B8" }}>
              <button onClick={() => onEdit(b)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-sm" style={{ background: "#E4D8B8", color: "#1F3A2E" }}>
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => onDelete(b.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-sm" style={{ background: "#F3D9D3", color: "#7A2E24" }}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
        {books.length === 0 && <p className="text-sm col-span-full py-6 text-center" style={{ color: "#8A7C64" }}>No books match that search.</p>}
      </div>
    </div>
  );
}

// ================= Members =================
function MembersView({ members, activeIssues, onAdd, onEdit, onDelete }) {
  const loansFor = (id) => activeIssues.filter((r) => r.memberId === id).length;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="serif text-3xl" style={{ color: "#1F3A2E" }}>Members</h1>
          <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>{members.length} enrolled</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium"
          style={{ background: "#1F3A2E", color: "#F2E8D5" }}
        >
          <Plus size={16} /> Enroll member
        </button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className="card-catalog rounded-sm p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="serif text-lg" style={{ color: "#1F3A2E" }}>{m.name}</h3>
                <span className="text-[10px] px-2 py-1 rounded-sm shrink-0" style={{ background: "#E4D8B8", color: "#1F3A2E" }}>{m.id}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>{m.email}</p>
              <p className="text-xs mt-1" style={{ color: "#8A7C64" }}>{m.phone}</p>
              <p className="text-xs mt-2" style={{ color: "#8A7C64" }}>Joined {m.joined} · {loansFor(m.id)} book{loansFor(m.id) !== 1 ? "s" : ""} on loan</p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: "#E4D8B8" }}>
              <button onClick={() => onEdit(m)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-sm" style={{ background: "#E4D8B8", color: "#1F3A2E" }}>
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => onDelete(m.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-sm" style={{ background: "#F3D9D3", color: "#7A2E24" }}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= Circulation =================
function CirculationView({ books, members, activeIssues, issueForm, setIssueForm, onIssue, onReturn, bookById, memberById }) {
  const availableBooks = books.filter((b) => b.available > 0);
  return (
    <div>
      <header className="mb-6">
        <h1 className="serif text-3xl" style={{ color: "#1F3A2E" }}>Issue / Return</h1>
        <p className="text-sm mt-1" style={{ color: "#6B5F4F" }}>Loans run for 14 days from the date issued.</p>
      </header>

      <div className="card-catalog rounded-sm p-5 mb-8">
        <h2 className="serif text-lg mb-4" style={{ color: "#1F3A2E" }}>Issue a book</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            value={issueForm.bookId}
            onChange={(e) => setIssueForm((f) => ({ ...f, bookId: e.target.value }))}
            className="px-3 py-2 rounded-sm text-sm outline-none"
            style={{ background: "#FBF6EA", border: "1px solid #D9CBA6" }}
          >
            <option value="">Choose a title</option>
            {availableBooks.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({b.available} left)</option>
            ))}
          </select>
          <select
            value={issueForm.memberId}
            onChange={(e) => setIssueForm((f) => ({ ...f, memberId: e.target.value }))}
            className="px-3 py-2 rounded-sm text-sm outline-none"
            style={{ background: "#FBF6EA", border: "1px solid #D9CBA6" }}
          >
            <option value="">Choose a member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={onIssue}
            disabled={!issueForm.bookId || !issueForm.memberId}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium disabled:opacity-40"
            style={{ background: "#1F3A2E", color: "#F2E8D5" }}
          >
            <Stamp size={15} /> Issue book
          </button>
        </div>
      </div>

      <h2 className="serif text-lg mb-3" style={{ color: "#1F3A2E" }}>Currently on loan ({activeIssues.length})</h2>
      <div className="flex flex-col gap-3">
        {activeIssues.map((r) => {
          const overdue = daysBetween(r.dueDate, iso(today)) > 0;
          return (
            <div key={r.id} className="card-catalog rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{bookById(r.bookId)?.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A7C64" }}>{memberById(r.memberId)?.name} · issued {r.issueDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm"
                  style={{ background: overdue ? "#F3D9D3" : "#DEE9DF", color: overdue ? "#7A2E24" : "#2F513E" }}
                >
                  {overdue ? <AlertTriangle size={12} /> : <Clock3 size={12} />}
                  {overdue ? `${daysBetween(r.dueDate, iso(today))} days overdue` : `Due ${r.dueDate}`}
                </span>
                <button
                  onClick={() => onReturn(r.id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm font-medium"
                  style={{ background: "#1F3A2E", color: "#F2E8D5" }}
                >
                  <CheckCircle2 size={13} /> Mark returned
                </button>
              </div>
            </div>
          );
        })}
        {activeIssues.length === 0 && <p className="text-sm py-3" style={{ color: "#8A7C64" }}>Every book is back on the shelf.</p>}
      </div>
    </div>
  );
}

// ================= Modals =================
function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(31,58,46,0.45)" }}>
      <div className="w-full max-w-md rounded-sm p-6" style={{ background: "#FBF6EA", border: "1px solid #D9CBA6" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="serif text-xl" style={{ color: "#1F3A2E" }}>{title}</h3>
          <button onClick={onClose}><X size={18} style={{ color: "#6B5F4F" }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookFormModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    id: data.id || null,
    title: data.title || "",
    author: data.author || "",
    genre: data.genre || GENRES[0],
    isbn: data.isbn || "",
    copies: data.copies || 1,
    available: data.available,
  });
  const isEdit = Boolean(data.id);

  const field = (label, key, type = "text") => (
    <div className="mb-3">
      <label className="text-xs" style={{ color: "#6B5F4F" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full mt-1 px-3 py-2 rounded-sm text-sm outline-none"
        style={{ background: "#fff", border: "1px solid #D9CBA6" }}
      />
    </div>
  );

  return (
    <ModalShell title={isEdit ? "Edit book" : "Add a book"} onClose={onClose}>
      {field("Title", "title")}
      {field("Author", "author")}
      <div className="mb-3">
        <label className="text-xs" style={{ color: "#6B5F4F" }}>Genre</label>
        <select
          value={form.genre}
          onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
          className="w-full mt-1 px-3 py-2 rounded-sm text-sm outline-none"
          style={{ background: "#fff", border: "1px solid #D9CBA6" }}
        >
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      {field("ISBN", "isbn")}
      {field("Number of copies", "copies", "number")}
      <button
        onClick={() =>
          onSave({
            ...form,
            available: isEdit ? Math.min(form.available, Number(form.copies)) : Number(form.copies),
          })
        }
        disabled={!form.title || !form.author}
        className="w-full mt-2 py-2.5 rounded-sm text-sm font-medium disabled:opacity-40"
        style={{ background: "#1F3A2E", color: "#F2E8D5" }}
      >
        {isEdit ? "Save changes" : "Add to catalogue"}
      </button>
    </ModalShell>
  );
}

function MemberFormModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    id: data.id || null,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
  });
  const isEdit = Boolean(data.id);

  const field = (label, key, type = "text") => (
    <div className="mb-3">
      <label className="text-xs" style={{ color: "#6B5F4F" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full mt-1 px-3 py-2 rounded-sm text-sm outline-none"
        style={{ background: "#fff", border: "1px solid #D9CBA6" }}
      />
    </div>
  );

  return (
    <ModalShell title={isEdit ? "Edit member" : "Enroll a member"} onClose={onClose}>
      {field("Full name", "name")}
      {field("Email", "email", "email")}
      {field("Phone", "phone")}
      <button
        onClick={() => onSave(form)}
        disabled={!form.name || !form.email}
        className="w-full mt-2 py-2.5 rounded-sm text-sm font-medium disabled:opacity-40"
        style={{ background: "#1F3A2E", color: "#F2E8D5" }}
      >
        {isEdit ? "Save changes" : "Enroll member"}
      </button>
    </ModalShell>
  );
}
