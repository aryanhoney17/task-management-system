# Task Management System

A full-stack task management app with JWT authentication, search, filters, priorities, and due dates.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MySQL · JWT

## Folder Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/db.js            # MySQL connection pool
│   │   ├── controllers/            # Business logic (auth, tasks)
│   │   ├── middleware/             # JWT auth guard, error handler
│   │   ├── routes/                 # Express routers
│   │   ├── sql/schema.sql          # Database schema
│   │   ├── utils/generateToken.js
│   │   ├── app.js                  # Express app config
│   │   └── server.js               # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                    # Axios instance + API calls
    │   ├── components/             # Navbar, TaskCard, TaskModal, Filters, etc.
    │   ├── context/AuthContext.jsx # Global auth state
    │   ├── pages/                  # Login, Register, Dashboard
    │   ├── App.jsx / main.jsx
    │   └── index.css
    ├── .env.example
    ├── tailwind.config.js
    └── package.json
```

## 1. Database Setup

Make sure MySQL is running, then create the schema:

```bash
mysql -u root -p < backend/src/sql/schema.sql
```

## 2. Backend Setup

```bash
cd backend
cp .env.example .env   # fill in DB credentials + a strong JWT_SECRET
npm install
npm run dev             # starts on http://localhost:5000
```

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env    # points to the API, defaults to http://localhost:5000/api
npm install
npm run dev              # starts on http://localhost:5173
```

## Features

- **Auth:** Register/login with bcrypt-hashed passwords and JWT tokens; protected routes on both client and API.
- **Task CRUD:** Create, read, update, delete tasks scoped to the logged-in user.
- **Search:** Live search across title and description.
- **Filters:** Filter by status (pending / in progress / completed) and priority (low / medium / high).
- **Sorting:** Sort by creation date, due date, priority, or title.
- **Due dates:** Set due dates, with overdue tasks flagged visually.
- **Pagination:** Server-side pagination for large task lists.
- **Dashboard stats:** Live counts for total, pending, in-progress, completed, and overdue tasks.

## API Endpoints

| Method | Endpoint                | Description                          | Auth |
|--------|--------------------------|---------------------------------------|------|
| POST   | /api/auth/register       | Register a new user                   | No   |
| POST   | /api/auth/login          | Log in, returns JWT                   | No   |
| GET    | /api/auth/me             | Get current user profile              | Yes  |
| GET    | /api/tasks               | List tasks (search/filter/sort/paginate via query params) | Yes  |
| GET    | /api/tasks/:id           | Get single task                       | Yes  |
| POST   | /api/tasks               | Create task                           | Yes  |
| PUT    | /api/tasks/:id           | Update task                           | Yes  |
| DELETE | /api/tasks/:id           | Delete task                           | Yes  |
| GET    | /api/tasks/stats/summary | Task counts for dashboard             | Yes  |

Query params for `GET /api/tasks`: `search`, `status`, `priority`, `dueBefore`, `dueAfter`, `sortBy`, `order`, `page`, `limit`.

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds).
- All task routes are protected by JWT middleware and scoped to `req.user.id` — users can only see/edit/delete their own tasks.
- `helmet` and `cors` are enabled on the API.
- Replace `JWT_SECRET` in `.env` with a long, random value before deploying.
