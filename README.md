# The Reading Room — Backend API

Library Management System ka backend (Node.js + Express + SQLite).
Aapke React `App.jsx` ke data aur rules ke hisaab se banaya gaya hai.

## Setup

```bash
npm install
npm start          # http://localhost:5000
```

Pehli baar chalane par database (`library.db`) khud ban jata hai aur sample data
(8 books, 4 members, 6 loans — jaisa dashboard screenshot me hai) load ho jata hai.

| Command | Kaam |
|---|---|
| `npm start` | Server chalu |
| `npm run dev` | Auto-reload ke saath |
| `npm run seed` | DB reset karke sample data dobara daalna |
| `npm test` | Smoke tests |

`.env` me `PORT`, `CORS_ORIGIN` (frontend URL), `LOAN_DAYS` badal sakte ho.

## API Endpoints

### Dashboard
| Method | URL | Description |
|---|---|---|
| GET | `/api/dashboard` | stats (titles, copies on shelf/loan, members, overdue), recent loans, genre counts |

### Books (Catalogue)
| Method | URL | Description |
|---|---|---|
| GET | `/api/books?q=&genre=` | Search title/author/ISBN + genre filter |
| GET | `/api/books/genres` | Genre list |
| GET | `/api/books/:id` | Ek book |
| POST | `/api/books` | `{title, author, genre, isbn, copies}` |
| PUT | `/api/books/:id` | Edit (copies kam nahi ho sakte jitne loan par hain usse) |
| DELETE | `/api/books/:id` | Loan par ho to `409` |

### Members
| Method | URL | Description |
|---|---|---|
| GET | `/api/members` | Sab members + `activeLoans` count |
| POST | `/api/members` | `{name, email, phone}` (joined = aaj ki date) |
| PUT | `/api/members/:id` | Edit |
| DELETE | `/api/members/:id` | Loan par book ho to `409` |

### Issue / Return
| Method | URL | Description |
|---|---|---|
| GET | `/api/issues?status=active\|returned\|overdue\|all` | Loans (`overdue`, `daysOverdue` ke saath) |
| POST | `/api/issues` | `{bookId, memberId}` — due date = aaj + 14 din |
| POST | `/api/issues/:id/return` | Return mark karo, copy wapas shelf par |

Errors hamesha `{ "error": "message" }` format me aate hain.

## Business rules (frontend jaise hi)
- Naye IDs: `B-109…`, `M-05…`, `R-1007…`
- Available copies 0 ho to issue nahi hoga
- Ek member ek hi book ki do copy ek saath issue nahi kar sakta
- Loan par chal rahi book ya member delete nahi ho sakta
- Issue/return stock update transaction ke andar hota hai (data kabhi inconsistent nahi hoga)

## Frontend se jodna
`frontend-integration/api.js` ko React project me copy karo (`src/api.js`) —
usme saare calls ready hain, aur file ke neeche `App.jsx` me use karne ka example hai.

## Folder structure
```
server.js
src/
  db.js          SQLite tables
  seed.js        sample data
  utils.js       helpers
  routes/        books, members, issues, dashboard
frontend-integration/api.js
test/smoke.test.js
```
