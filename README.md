# ServiceHub — MERN Service Booking App

A full-stack MERN application with **Customer** and **Vendor** roles, OTP-based customer registration, service listing, and booking management.

---

## 📁 Project Structure

```
mern-service/
├── backend/
│   ├── models/         # User, Service, Booking (Mongoose)
│   ├── routes/         # auth, services, bookings
│   ├── middleware/     # JWT auth, role guards
│   ├── utils/          # OTP generator + email sender
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/      # Home, Login, Register, Dashboards
    │   ├── components/ # Navbar
    │   ├── context/    # AuthContext
    │   └── utils/      # Axios instance
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and email credentials
npm run dev
```

Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000** (proxies /api → localhost:5000)

---

## 🔑 Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/serviceapp
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords

> **Dev mode**: If EMAIL_USER is not configured, OTPs are printed to the console instead.

---

## 👥 User Roles

### Customer
- Sign up with **OTP verification** (email)
- Browse & filter services by category
- Book services with date, address, notes
- Track booking status
- Cancel pending/approved bookings

### Vendor
- Register without OTP
- Add/delete their own services
- View all bookings for their services
- **Approve** → **Start** → **Mark Delivered**

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Customer register (sends OTP) |
| POST | /api/auth/verify-otp | Verify OTP → get token |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/auth/login | Login (both roles) |
| POST | /api/auth/vendor-register | Vendor register (no OTP) |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/services | Public | List all services (filter: ?category=X) |
| GET | /api/services/my | Vendor | Vendor's own services |
| POST | /api/services | Vendor | Add service |
| PUT | /api/services/:id | Vendor | Update service |
| DELETE | /api/services/:id | Vendor | Delete service |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/bookings | Customer | Book a service |
| GET | /api/bookings/my | Customer | Customer's bookings |
| GET | /api/bookings/vendor | Vendor | Vendor's received bookings |
| PATCH | /api/bookings/:id/status | Vendor | Update status |
| PATCH | /api/bookings/:id/cancel | Customer | Cancel booking |

---

## 🔄 Booking Status Flow

```
pending → approved → in-progress → delivered
       ↘ cancelled (vendor or customer)
```

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer
- **Frontend**: React 18, React Router v6, Axios, react-hot-toast
- **Auth**: JWT tokens in localStorage, OTP via email (Nodemailer/Gmail)
