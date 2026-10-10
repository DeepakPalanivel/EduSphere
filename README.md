# CampusOne

**One Destination. Every Student Need.**

CampusOne is a full-stack web application that helps college students find study materials, discover software with student plans, and explore scholarships in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, Lucide React |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Uploads | Multer |
| Validation | Zod |

---

## Project Structure

```
CampusOne/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios API calls
│       ├── components/  # Shared UI components
│       ├── context/     # Auth context
│       └── pages/       # All pages
├── server/          # Node.js + Express backend
│   └── src/
│       ├── config/      # DB connection
│       ├── controllers/ # Route handlers
│       ├── middleware/  # Auth, upload, errors
│       ├── models/      # Mongoose models
│       ├── routes/      # Express routes
│       ├── seed/        # Seed script
│       └── utils/       # Helpers
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ — https://nodejs.org
- **MongoDB** 6+ (local or Atlas) — https://www.mongodb.com/try/download/community
- npm 9+

---

## Installation & Setup

### 1. Clone / Open the project

```
cd CampusOne
```

### 2. Set up the server

```bash
cd server
copy .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, ADMIN_INIT_KEY
npm install
```

### 3. Set up the client

```bash
cd ../client
npm install
```

---

## Environment Variables

### server/.env

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for JWT signing |
| `JWT_EXPIRE` | Token expiry e.g. `7d` |
| `ADMIN_INIT_KEY` | Secret key to create the first admin account |
| `CLIENT_URL` | Frontend URL for CORS (default http://localhost:5173) |
| `MAX_FILE_SIZE_MB` | Max upload size in MB (default 10) |

---

## Running the Application

### Start MongoDB (if local)
```bash
mongod
```

### Start the server (terminal 1)
```bash
cd server
npm run dev
```
Server runs at: http://localhost:5000

### Start the client (terminal 2)
```bash
cd client
npm run dev
```
App runs at: http://localhost:5173

---

## Seed the Database

Populates sample users, study materials, software, and scholarship data.

```bash
cd server
npm run seed
```

After seeding:
- **Student login:** priya@student.edu / Student@123
- **Admin login:** admin@campusone.edu / Admin@123

---

## Creating the First Admin (Alternative)

If you skip the seed, create an admin via the API:

```bash
POST /api/auth/init-admin
{
  "adminKey": "<your ADMIN_INIT_KEY from .env>",
  "fullName": "Admin User",
  "email": "admin@yoursite.edu",
  "password": "SecurePassword123"
}
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | — | Health check |
| POST | /api/auth/register | — | Register student |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | JWT | Get current user |
| POST | /api/auth/init-admin | Key | Create first admin |
| GET | /api/materials | Optional | List materials |
| POST | /api/materials | JWT | Upload material |
| DELETE | /api/materials/:id | JWT (owner/admin) | Delete material |
| GET | /api/software | Optional | List software |
| POST | /api/software | Admin | Add software |
| GET | /api/scholarships | Optional | List scholarships |
| GET | /api/scholarships/match | Optional | Match scholarships |
| POST | /api/scholarships | Admin | Add scholarship |
| GET | /api/search?q= | Optional | Global search |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/users | Admin | All users |

---

## Features

### Students
- Register / login
- Edit profile (name, department, course, year)
- Browse and search study materials
- Upload notes and files (PDF, PPT, DOCX, etc.)
- Discover software with student plans and free tiers
- Find and match scholarships by course, state, marks, income
- Global search across all modules

### Admins
- View platform statistics
- Approve / reject uploaded materials
- Add, edit, verify, delete software entries
- Add, edit, verify, delete scholarship entries
- Manage user accounts (promote to admin, deactivate)

---

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT authentication — tokens expire after 7 days
- Role-based access control (student / admin)
- Login rate limiting (20 requests per 15 minutes)
- Helmet security headers
- CORS restricted to frontend URL
- File upload validation (type + size)
- Input validation via Zod on all API routes

---

## Testing the Application

After starting both server and client:

1. **Register** a new student account at `/register`
2. **Login** and verify you reach the dashboard at `/dashboard`
3. **Upload** a study material at `/materials`
4. **Browse** software at `/software`
5. **Match** scholarships at `/scholarships` using your details
6. **Search** across modules at `/search`
7. **Admin login** at `/login` → navigate to `/admin` for the admin dashboard
8. **Init admin** via `POST /api/auth/init-admin` if needed

---

## Build for Production

```bash
# Build frontend
cd client
npm run build
# Output: client/dist/

# Run server in production mode
cd ../server
NODE_ENV=production node src/index.js
```

---

## Troubleshooting

**MongoDB connection failed**
- Ensure `mongod` is running: `mongod --dbpath /data/db`
- Or update `MONGO_URI` in `.env` to your Atlas connection string

**Port already in use**
- Change `PORT` in `server/.env`
- Change `server.port` in `client/vite.config.js`

**npm install fails**
- Ensure Node.js 18+ is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`

**Uploads not working**
- The `server/uploads/materials/` directory is created automatically
- Ensure `MAX_FILE_SIZE_MB` is set appropriately

---

## Scholarship Disclaimer

Scholarship information is provided for awareness only. CampusOne does not guarantee eligibility. Sample/demonstration data is clearly labeled. Always verify requirements and deadlines directly on official scholarship portals before applying.
