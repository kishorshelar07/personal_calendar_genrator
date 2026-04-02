# CalendarPro — Personal Calendar Generator (MERN Stack v2)

## Project Structure
```
pcg/
├── backend/          ← Node.js + Express API
└── frontend/         ← React + Vite app
```

## 🚀 Quick Start

### 1. Start MongoDB
Make sure MongoDB is running locally on port 27017.

### 2. Create First Admin User
Open `mongosh` and run:
```js
use dbcalendar
db.users.insertOne({
  usr_id: "9999999999",
  usr_name: "Super Admin",
  usr_pass: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  usr_status: 1,
  usr_type: "Admin",
  usr_dob: new Date("1990-01-01"),
  usr_email: "admin@example.com",
  usr_gender: "Male",
  usr_reg_date_time: new Date(),
  usr_remarks: "Default Admin"
})
```
**Login:** Mobile: `9999999999` | Password: `password`

### 3. Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## ✅ Features

### User Features
- Register / Login with JWT auth
- Dashboard with calendar stats
- Create, edit, delete own calendars
- Upload up to 24 images per calendar
- Generate 3 calendar templates (1-page, 12-page, 3-page)
- Print-ready calendar output

### Admin Panel (`/admin/*`)
- **Admin Dashboard** — full system stats (users, calendars by type)
- **User Management** — add, edit, delete users; toggle active/inactive with a switch
- **All Calendars** — read-only view of every user's calendars

### Calendar Templates
| Template | Pages | Layout |
|----------|-------|--------|
| Template 1 | 1 | All 12 months in a 4-column grid + 3 large images |
| Template 2 | 12 | One month per page with full-size zoomable/draggable image |
| Template 3 | 3 | 4 months per page (2×2 grid) with one image per page |

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users (JWT required)
- `GET  /api/users` — all (admin) or own (user)
- `POST /api/users` — admin only
- `PUT  /api/users/:id`
- `DELETE /api/users/:id` — admin only
- `PATCH /api/users/:id/toggle-status` — admin only
- `GET  /api/users/stats` — admin only
- `POST /api/users/search`

### Calendars (JWT required)
- `GET  /api/calendars`
- `POST /api/calendars`
- `PUT  /api/calendars/:id`
- `DELETE /api/calendars/:id`
- `GET  /api/calendars/stats` — admin only

### Upload (JWT required)
- `POST /api/upload/images` — multipart/form-data
- `GET  /api/upload/:filename`
- `DELETE /api/upload/file/:filename`

---

## 🗄️ Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dbcalendar
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
```
