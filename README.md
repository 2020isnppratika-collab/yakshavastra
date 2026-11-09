# YakshaVastra — Yakshagana Costume Rental Platform

> A production-grade, end-to-end web application where users browse authentic Yakshagana theatre costumes, check live date and time-slot availability, book them with double-booking prevention, pay via Razorpay (test mode) or instant 1-click mock payment sandbox, and receive official receipts. Includes a complete administrator portal for inventory and booking management.

---

## 🌟 Key Features Built

### 1. Public Catalogue & Filtering
- **36+ Authentic Costumes Seeded on Day One**: Complete character sets, master-carved Shivani wood Kireetas (crowns), gold-leaf foil Bhujakeerthis (shoulder guards), Edur Kante (chest plates), flared pleated Kachche skirts, weapons (Gada, Dhanus, Swords), and heavy brass Gaggara ankle bells.
- **Multi-faceted Filtering**:
  - By **Category**: Full Sets, Crowns/Kireetas, Ornaments, Garments, Weapons, Accessories.
  - By **Character Role**: Raja (King/Hero), Rakshasa (Demon), Stree Vesha (Female Roles), Hanuman / Vanara, Rishi / Muni (Sage), Bannada Vesha (Fierce Painted), Vidushaka (Comic).
  - By **Rental Mode**: Day-based rental vs. Slot-based rental.
  - By **Date Availability**: Automatically filters and displays only costumes with available capacity for the requested date window.
  - **Debounced Instant Search**: Search in English or Kannada script.
  - **Sort**: Most Popular, Price Low-to-High, Price High-to-Low, Alphabetical.
- **Bilingual Interface**: Seamless toggle between **English** and **ಕನ್ನಡ (Kannada)** across the platform.

### 2. Costume Detail & Live Availability Calendar
- **Interactive Image Gallery**: Thumbnail selector with high-resolution cultural theatre photography.
- **Live Availability Calendar**:
  - Visual monthly grid marking blocked and available dates.
  - Displays remaining units for each day and slot (e.g., `2 left`).
  - Automatic **buffer gap indicator** (e.g., 1 day cleaning and repair gap after each return).
- **Slot Selection**:
  - **Full Day**: 24 hours.
  - **Morning Slot**: 6:00 AM – 2:00 PM (8 hrs) for rehearsals and rituals.
  - **Evening Slot**: 2:00 PM – 10:00 PM (8 hrs) for evening shows.
  - **Night Slot (ಇಡೀ ರಾತ್ರಿ ಆಟ)**: 6:00 PM – 6:00 AM (12 hrs overnight) - traditional Yakshagana show timing.
- **Real-Time Price & Deposit Breakdown**:
  - Live calculations of Rental Rate, 100% Refundable Security Deposit, 5% GST, and Total Payable.

### 3. Cart & Concurrency-Safe Checkout
- **Multi-Item Booking Cart**: Adjust units, change sizes, view rental coverage.
- **10-Minute Hold Lock**: Concurrency-safe hold created upon checkout; prevents two users from booking the last unit simultaneously.
- **Event & Troupe Information**: Event name, troupe name, venue, city (Udupi, Mangaluru, Kundapura, Bengaluru), and contact phone.
- **Pickup Mode**: Choice of City Hub Self-Pickup vs. Express Troupe Delivery.
- **Flexible Payments**:
  - **Razorpay Test Mode**: Integrated with Razorpay Checkout JS modal.
  - **Instant Mock Payment Sandbox**: 1-click test checkout (with Success / Failure simulation buttons) for offline or demoing without gateway credentials.

### 4. Booking Confirmation & Customer Account
- **Celebration Banner**: Joyful confetti animation upon confirmed reservation.
- **Unique Booking Code**: Format `YKB-YYYYMMDD-XXXX`.
- **Printable Receipt**: Itemized summary of rental fees and refundable deposits.
- **"My Bookings" Portal**:
  - Live status tracking: `Pending Payment` &rarr; `Confirmed` &rarr; `Picked Up` &rarr; `Returned` &rarr; `Cancelled`.
  - Policy-based cancellation with automatic refund calculation:
    - &gt; 7 days before start: 100% rental refund + 100% deposit refund.
    - 3 to 7 days: 50% rental refund + 100% deposit refund.
    - &lt; 3 days: 0% rental refund (100% deposit refund).

### 5. Administrator Portal
- **Dashboard & KPIs**: Total Revenue, Total Bookings, Active Rentals on stage, Upcoming Pickups, Pending Returns, and Most In-Demand Costumes.
- **1-Click Demo Reset**: Reset and re-seed the entire database back to a clean demo state with 1 click.
- **Costume Inventory CRUD**: Add, edit, or delete costumes; adjust stock counts, buffer days, daily rates, slot prices, sizes, and included pieces.
- **Bookings Manager**: Filter by status, search by code or troupe, and update statuses (`Confirmed`, `Picked Up`, `Returned`, `Cancelled`).
- **Return Inspection Modal**: Record physical return date, adjust damage or late fees, and calculate net deposit refund release.
- **Rental Schedule Calendar**: Monthly overview of warehouse bookings.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | TypeScript, Tailwind CSS v4, Lucide React, React Router v6, Canvas Confetti |
| **Backend** | Python 3.11 + FastAPI | Async REST API, Pydantic v2 schemas, Auto-generated Swagger at `/docs` |
| **Database** | Motor (Async MongoDB) | Seamless dual-mode: connects to MongoDB Atlas / local MongoDB, with an automatic in-memory fallback engine for zero-setup execution |
| **Auth** | JWT + bcrypt | Access tokens with role-based guards (`customer`, `admin`) |
| **Payments** | Razorpay + Mock Sandbox | Razorpay Checkout SDK + HMAC-SHA256 signature verification + 1-click sandbox |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.11+)

---

### Step 1: Run the FastAPI Backend

1. Open a terminal in the project directory:
   ```powershell
   cd backend
   ```
2. Activate the virtual environment:
   ```powershell
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```
3. Start the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. Verify backend health:
   - API Health: [http://localhost:8000/health](http://localhost:8000/health)
   - Interactive Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 2: Run the React Frontend

1. Open a second terminal in the project directory:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Open your browser at:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Accounts (Pre-configured)

Use the 1-click login buttons on the Sign In page, or enter the credentials below:

| Role | Email | Password | Access |
|---|---|---|---|
| **Demo Customer** | `customer@demo.com` | `Customer@123` | Browsing, Cart, Checkout, My Bookings, Cancellation |
| **Demo Admin** | `admin@demo.com` | `Admin@123` | Inventory CRUD, Dashboard, Return Inspection, Reset Demo Seed |

---

## 🧪 Running the Backend Test Suite

To run all 9 comprehensive tests (covering overlap algorithms, buffer day math, pricing calculations, authentication, checkout flow, and double-booking locks):

```powershell
$env:PYTHONPATH='backend'
backend\venv\Scripts\pytest.exe backend\tests -v
```

Expected output:
```
backend\tests\test_api.py::test_health_and_costumes PASSED
backend\tests\test_api.py::test_auth_and_booking_flow PASSED
backend\tests\test_api.py::test_double_booking_prevention PASSED
backend\tests\test_availability.py::test_ranges_overlap_cases PASSED
backend\tests\test_availability.py::test_buffer_days_extension PASSED
backend\tests\test_availability.py::test_booked_units_and_capacity PASSED
backend\tests\test_pricing.py::test_day_based_pricing PASSED
backend\tests\test_pricing.py::test_slot_based_pricing PASSED
backend\tests\test_pricing.py::test_total_pricing_with_taxes PASSED
============================== 9 passed in 2.70s ==============================
```

---

## 📁 Repository Structure

```
costume-book/
├── backend/
│   ├── app/
│   │   ├── core/           # Config (Pydantic Settings), Security (JWT, bcrypt), Deps
│   │   ├── db/             # Motor async MongoDB client + resilient In-Memory fallback
│   │   ├── models/         # Document models
│   │   ├── schemas/        # Request & Response schemas (auth, costume, booking, payment, admin)
│   │   ├── routers/        # auth.py, costumes.py, bookings.py, payments.py, admin.py
│   │   ├── services/       # availability.py, pricing.py, booking.py, payment.py, email.py, seed.py
│   │   └── main.py         # FastAPI application entrypoint with CORS & routes
│   ├── tests/              # pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # API client wrapper
│   │   ├── components/     # Navbar, Footer, CostumeCard, AvailabilityCalendar, SlotPicker
│   │   ├── context/        # AuthContext, CartContext, LanguageContext
│   │   ├── pages/          # Home, Catalogue, CostumeDetail, Cart, Checkout, Confirmation, MyBookings, About
│   │   │   └── admin/      # AdminDashboard, AdminCostumes, AdminBookings, AdminCalendar
│   │   ├── types/          # TypeScript interfaces
│   │   ├── lib/            # Currency, date, and styling utilities
│   │   ├── App.tsx         # Router and layout configuration
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```

---

*Prepared for client demo & production deployment.*
