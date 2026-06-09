# 🎟️ Eventora — Event Booking Platform

A full-stack event booking platform where users can discover events, book tickets with OTP verification, and pay securely via Razorpay. Admins can manage events, confirm bookings, and track revenue from a dedicated dashboard.

**🌐 Live Demo:** [eventora-6n0c9ywup-shreesh-pathaks-projects-86e9f42a.vercel.app](https://eventora-6n0c9ywup-shreesh-pathaks-projects-86e9f42a.vercel.app/)

---

## ✨ Features

**Users**
- Register & Login with OTP email verification
- Browse & search events by title, category, location, price
- View full event details — date, time, location, seats, price
- Book tickets with OTP verification
- Pay securely via Razorpay (test mode)
- View booking history with status & payment info
- Cancel confirmed bookings

**Admins**
- Create, manage & delete events
- View all user booking requests
- Approve bookings as Paid or Unpaid
- Reject pending booking requests
- Track total revenue, paid clients & pending requests
- Auto seat management on confirm/cancel

**Security**
- JWT-based authentication
- OTP verification for register, login & booking
- Razorpay payment signature verification (HMAC SHA256)
- Protected routes — users & admins separately
- Passwords never sent in API responses

---

## 🛠️ Tech Stack

**Frontend**
| Technology | Usage |
|-----------|-------|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| Axios | API calls with interceptors |
| React Router v6 | Client-side routing |
| Context API | Global auth state |
| Vite | Build tool |

**Backend**
| Technology | Usage |
|-----------|-------|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| Nodemailer | OTP email service |
| Razorpay | Payment gateway |
| bcryptjs | Password hashing |
| dotenv | Environment config |

**Deployment**
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 📁 Project Structure

```
EVENTORA/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Events listing + search
│   │   │   ├── Login.jsx           # Login + OTP verify
│   │   │   ├── Register.jsx        # Register + OTP verify
│   │   │   ├── EventDetail.jsx     # Event detail + booking
│   │   │   ├── UserDashboard.jsx   # My bookings
│   │   │   └── AdminDashboard.jsx  # Admin panel
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── utils/
│   │       └── axios.js            # Axios instance + interceptors
│   ├── .env
│   ├── .env.production
│   └── index.html
│
└── server/                     # Express Backend
    ├── controllers/
    │   ├── authController.js       # Register, Login, OTP
    │   ├── eventController.js      # CRUD events
    │   ├── bookingController.js    # Book, confirm, cancel
    │   └── paymentController.js    # Razorpay order + verify
    ├── models/
    │   ├── User.js
    │   ├── Event.js
    │   ├── Booking.js
    │   └── OTP.js
    ├── routes/
    │   ├── auth.js
    │   ├── events.js
    │   ├── booking.js
    │   └── payment.js
    ├── middleware/
    │   └── auth.js                 # protect + admin middleware
    ├── utils/
    │   └── emailService.js
    ├── conn.js                     # MongoDB connection
    └── index.js                    # Entry point
```

---

## 🗄️ Database Models

**User**
```
name, email, password (hashed), role (user/admin), verified, timestamps
```

**Event**
```
title, description, date, time, location, category,
totalSeats, availableSeats, ticketPrice, imageUrl, createdBy, timestamps
```

**Booking**
```
user (ref), event (ref), numberOfSeats, status (pending/confirmed/cancelled),
paymentStatus (paid/not_paid), amount, razorpayOrderId, razorpayPaymentId, timestamps
```

**OTP**
```
email, otp, action (register/login/event_booking), expiresAt
```

---

## 🔌 API Endpoints

**Auth** — `/api/auth`
```
POST   /register          Register new user (sends OTP)
POST   /login             Login (sends OTP if unverified)
POST   /verify-otp        Verify OTP → get JWT token
```

**Events** — `/api/events`
```
GET    /                  Get all events (with filters)
GET    /:id               Get single event
POST   /                  Create event (admin only)
PUT    /:id               Update event (admin only)
DELETE /:id               Delete event (admin only)
```

**Bookings** — `/api/bookings`
```
POST   /                  Book an event (OTP required)
POST   /send-otp          Send booking OTP
GET    /my                Get my bookings (user)
GET    /all               Get all bookings (admin)
PUT    /:id/confirm       Confirm booking (admin)
DELETE /:id               Cancel booking
```

**Payment** — `/api/payment`
```
POST   /create-order      Create Razorpay order
POST   /verify            Verify payment signature
```

---

## 🚀 Getting Started — Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test keys)
- Gmail account (for Nodemailer)

### 1. Clone the repo

```bash
git clone https://github.com/shreesh001/Eventora.git
cd eventora
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/eventora
JWT_SECRET=your_super_secret_key
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

```bash
npm run dev
```

### 4. Run Both Together (Optional)

Install concurrently at root level:
```bash
cd ..  # EVENTORA root
npm install concurrently --save-dev
```

Root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\""
  }
}
```

```bash
npm run dev
```

Frontend → `http://localhost:5173`
Backend  → `http://localhost:5001`

---

## 💳 Payment Flow

```
1. User books event → OTP verify → Booking created (pending)
         ↓
2. Free event  → Admin manually confirms
   Paid event  → Razorpay popup opens
         ↓
3. User pays → Razorpay sends { order_id, payment_id, signature }
         ↓
4. Backend verifies signature using HMAC SHA256
         ↓
5. Valid → Booking auto-confirmed, seats updated ✅
   Invalid → Rejected ❌
```

**Test Card:**
```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date
CVV         : Any 3 digits
OTP         : 1234
```

---

## 🌐 Deployment

**Backend → Render**
```
Build Command : npm install --prefix server
Start Command : node server/index.js

Environment Variables:
MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, PORT
```

**Frontend → Vercel**
```
Framework     : Vite
Root Directory: client
Build Command : npm run build
Output Dir    : dist

Environment Variables:
VITE_API_URL = https://your-backend.onrender.com/api
```

---

## 🔐 Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | Server | Backend port (5001) |
| `MONGO_URI` | Server | MongoDB Atlas connection string |
| `JWT_SECRET` | Server | Secret for JWT signing |
| `EMAIL_USER` | Server | Gmail address for OTP emails |
| `EMAIL_PASS` | Server | Gmail app password |
| `RAZORPAY_KEY_ID` | Server + Client | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Server only | Razorpay secret — never expose! |
| `VITE_API_URL` | Client | Backend API base URL |

---

## 👤 Default Roles

To make a user admin — update directly in MongoDB:
```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 📝 License

MIT License — free to use and modify.

---

## 🙋‍♂️ Author

**Shreesh Pathak**
- GitHub: [@shreesh001](https://github.com/shreesh001)

---

> Built with ❤️ using React, Node.js, MongoDB & Razorpay