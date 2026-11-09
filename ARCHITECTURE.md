# Yakshagana Costume Rental Platform — Architecture (Client Demo)

> **Goal:** A working, end-to-end web application where users browse Yakshagana costumes, check availability for a date/slot, book (rent) them, pay (test mode), and receive confirmation. An admin manages inventory and bookings. The app is hosted temporarily so the client can open it through a public link.

---

## 1. Scope of the Demo

### In scope (must work end to end)
- Public catalogue: browse, search, filter costumes
- Costume detail page with images, rent price, deposit, and availability calendar
- Slot-based booking (date range + time slot) with double-booking prevention
- Cart / multi-item booking
- User signup / login (JWT)
- Payment (Razorpay **test mode**) with a mock fallback
- Booking confirmation (on-screen + email)
- "My Bookings" page (view, cancel)
- Admin panel: manage costumes, view/approve/cancel bookings, mark picked-up / returned
- Seed data (30–50 realistic costumes) so the demo looks real on day one

### Out of scope for the demo (list in roadmap)
- Real payments, KYC, GST invoicing
- Native mobile app
- Delivery logistics / courier integration
- Multi-vendor marketplace

---

## 2. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React 18 + Vite**, React Router, TanStack Query, Tailwind CSS, shadcn/ui | Fast build, good-looking UI quickly |
| Calendar/date UI | `react-day-picker` or `react-datepicker` | Availability calendar |
| Backend | **Python 3.11 + FastAPI** | Fast, auto-generated API docs (Swagger) — great for demos |
| Validation | Pydantic v2 | Request/response schemas |
| DB driver | **Motor** (async MongoDB) + Beanie ODM (optional) | Async, clean models |
| Database | **MongoDB Atlas (free M0 tier)** | Zero setup, hosted, free |
| Auth | JWT (access token) + bcrypt password hashing | Simple and standard |
| Image storage | **Cloudinary** (free tier) | Hosted images + automatic resizing |
| Payments | **Razorpay test mode** (India-friendly) | Real checkout flow without real money |
| Email | **Resend / Brevo / SendGrid** (free tier) or Gmail SMTP | Booking confirmation mails |
| Hosting (frontend) | **Vercel** or **Netlify** | Free, HTTPS, instant public link |
| Hosting (backend) | **Render** (or Railway / Fly.io) | Free/cheap Docker or Python service |
| Alternative quick-link | **Cloudflare Tunnel / ngrok** | Expose a locally running app as a temporary URL |

> **About Lovable:** Lovable (and similar tools like Bolt/v0) can generate and host the **React frontend** quickly, but it will not run your Python FastAPI backend. Recommended split: frontend on Vercel/Netlify (or Lovable), backend on Render, database on Atlas. If you use Lovable for the UI, point its API base URL at the Render backend and enable CORS for the Lovable domain.

---

## 3. High-Level Architecture

```
                        ┌──────────────────────────────┐
                        │        Client / Browser      │
                        │  (Customer UI + Admin UI)    │
                        └───────────────┬──────────────┘
                                        │ HTTPS
                        ┌───────────────▼──────────────┐
                        │  React SPA (Vercel/Netlify)  │
                        │  - Pages, cart, calendar     │
                        │  - Razorpay Checkout JS      │
                        └───────────────┬──────────────┘
                                        │ REST/JSON (JWT)
                        ┌───────────────▼──────────────┐
                        │   FastAPI (Render, Docker)   │
                        │  ┌────────────────────────┐  │
                        │  │ Routers (auth, costumes│  │
                        │  │ bookings, payments,    │  │
                        │  │ admin)                 │  │
                        │  ├────────────────────────┤  │
                        │  │ Services (availability,│  │
                        │  │ pricing, booking)      │  │
                        │  ├────────────────────────┤  │
                        │  │ Repositories (Motor)   │  │
                        │  └────────────────────────┘  │
                        └──┬─────────┬─────────┬───────┘
                           │         │         │
              ┌────────────▼──┐  ┌───▼──────┐  ┌▼──────────────┐
              │ MongoDB Atlas │  │Cloudinary│  │ Razorpay /    │
              │ (data)        │  │ (images) │  │ Email service │
              └───────────────┘  └──────────┘  └───────────────┘
```

**Style:** Single-page app + stateless REST API + managed database. Monolithic backend (modular folders) — right-sized for a demo and easy to split later.

---

## 4. Domain Concepts (Yakshagana-specific)

Yakshagana is a traditional theatre form from coastal Karnataka. Costumes are typically rented as **sets** (a complete character look) or as **individual pieces**.

### Suggested categories (confirm names with the client)
- **By character type:** Raja Vesha (king), Rakshasa Vesha (demon), Stree Vesha (female role), Hanuman / Vanara Vesha, Rishi/Sage, Bannada Vesha (colour-painted characters), Comic characters
- **By item type:** Full set, Crown/Headgear (Kireeta, Mundasu etc.), Shoulder & chest ornaments (Bhujakeerthi etc.), Upper-body costume, Lower garments, Accessories (weapons/props, jewellery, face-paint materials)
- **By size:** Child / Adult S–M–L–XL / Free-size adjustable
- **By troupe-use:** Stage-performance grade vs. practice/rehearsal grade

> The exact Kannada/Tulu terms and classification should be validated with the client. The data model below keeps `category`, `character_type`, and `tags` flexible so naming can change without schema changes.

### Rental concepts
- **Slot:** A bookable time window. Support two modes (configurable per costume):
  1. **Day-based** — rent for N full days (e.g., 12 Dec – 14 Dec)
  2. **Slot-based** — fixed slots in a day: `Morning (6am–2pm)`, `Evening (2pm–10pm)`, `Night (6pm–6am)` — important because Yakshagana shows are often performed overnight
- **Quantity / stock:** A costume SKU can have multiple physical units (e.g., 3 identical Kireeta). Availability = total units − units booked in overlapping slots.
- **Buffer time:** Cleaning/repair gap after each return (e.g., 1 day) so back-to-back bookings don't collide.
- **Deposit:** Refundable security deposit, held until return and inspection.
- **Late fee / damage fee:** Calculated on return by admin.

---

## 5. Data Model (MongoDB Collections)

### 5.1 `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "phone": "string",
  "password_hash": "string",
  "role": "customer | admin",
  "address": { "line1": "", "city": "", "state": "", "pincode": "" },
  "created_at": "datetime"
}
```

### 5.2 `costumes`
```json
{
  "_id": "ObjectId",
  "sku": "YK-RAJA-001",
  "name": "Raja Vesha Full Set",
  "description": "string",
  "category": "full_set | crown | ornament | garment | accessory",
  "character_type": "raja | rakshasa | stree | hanuman | ...",
  "tags": ["royal", "gold", "stage-grade"],
  "sizes": ["Free", "M", "L"],
  "images": ["https://res.cloudinary.com/..."],
  "price_per_day": 1500,
  "price_per_slot": { "morning": 700, "evening": 800, "night": 1200 },
  "security_deposit": 3000,
  "total_units": 3,
  "buffer_days": 1,
  "rental_mode": "day | slot",
  "is_active": true,
  "includes": ["Kireeta", "Chest piece", "Skirt"],
  "care_notes": "Dry clean only",
  "created_at": "datetime"
}
```
**Indexes:** `sku` (unique), text index on `name, description, tags`, compound `(category, is_active)`.

### 5.3 `bookings`
```json
{
  "_id": "ObjectId",
  "booking_code": "YKB-20261109-0042",
  "user_id": "ObjectId",
  "items": [
    {
      "costume_id": "ObjectId",
      "name": "snapshot of costume name",
      "size": "L",
      "quantity": 1,
      "unit_price": 1500,
      "start_at": "datetime (UTC)",
      "end_at": "datetime (UTC)",
      "slot": "morning | evening | night | full_day",
      "blocked_until": "datetime (end_at + buffer)"
    }
  ],
  "event_details": { "event_name": "", "venue": "", "city": "", "contact_phone": "" },
  "pricing": { "subtotal": 0, "deposit": 0, "taxes": 0, "discount": 0, "total_payable": 0 },
  "status": "pending_payment | confirmed | picked_up | returned | cancelled | expired",
  "payment": { "provider": "razorpay", "order_id": "", "payment_id": "", "status": "created | paid | failed | refunded" },
  "pickup_mode": "self_pickup | delivery",
  "notes": "",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `(user_id, created_at)`, `(items.costume_id, items.start_at, items.blocked_until)`, `booking_code` (unique), `status`.

### 5.4 `availability_holds` (temporary locks)
Created when the user proceeds to checkout; auto-expires (e.g., 10 minutes) using a **TTL index** on `expires_at`. Prevents two people paying for the last unit at the same time.
```json
{
  "_id": "ObjectId",
  "costume_id": "ObjectId",
  "quantity": 1,
  "start_at": "datetime",
  "blocked_until": "datetime",
  "user_id": "ObjectId",
  "expires_at": "datetime (TTL index)"
}
```

### 5.5 `blackout_dates` (optional)
Dates when a costume or the whole shop is unavailable (festival season reserved, maintenance).

### 5.6 `reviews` (optional, nice for demo polish)
`costume_id, user_id, rating, comment, created_at`

---

## 6. Availability & Booking Logic (the core of the app)

### Overlap rule
Two time ranges overlap if: `A.start < B.blocked_until AND B.start < A.blocked_until`.

### Availability check (per costume, per requested range)
```
requested = [start_at, end_at + buffer]
booked_units = SUM(quantity) of
    bookings (status in confirmed, picked_up, pending_payment)
  + active availability_holds
  where costume matches AND ranges overlap with requested
available_units = costume.total_units - booked_units
is_available = available_units >= requested_quantity
```

### Booking flow (concurrency-safe)
1. User selects dates/slot → `GET /costumes/{id}/availability` shows remaining units.
2. User adds to cart → proceeds to checkout.
3. `POST /bookings/checkout` →
   - Re-run availability check inside a **MongoDB transaction** (Atlas supports it) or use an atomic hold insert + re-check pattern.
   - Create `availability_holds` (10 min TTL) and booking with `status = pending_payment`.
   - Create Razorpay order → return `order_id`.
4. Frontend opens Razorpay Checkout (test mode).
5. On success, frontend calls `POST /payments/verify` (signature verification) **and** Razorpay webhook `POST /payments/webhook` confirms server-side.
6. Booking → `confirmed`, hold removed, email sent.
7. If payment not done within 10 minutes → hold expires; a background job marks booking `expired`.

### Pricing service
`total = Σ(unit_price × units × duration) + deposit (+ tax) − discount`. Keep in one backend service so the frontend only displays what the API returns (never trusts client-calculated prices).

### Cancellation policy (configurable)
- > 7 days before start: full refund
- 3–7 days: 50% refund
- < 3 days: no refund (deposit still returned if unused)

---

## 7. REST API Design

Base URL: `/api/v1` — Swagger UI auto-available at `/docs` (show this to the client; it impresses).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Returns JWT |
| GET | `/auth/me` | Current user |

### Costumes (public)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/costumes` | List with filters: `q, category, character_type, size, min_price, max_price, available_from, available_to, page, limit, sort` |
| GET | `/costumes/{id}` | Detail |
| GET | `/costumes/{id}/availability?start=&end=&slot=` | Units available + blocked dates for calendar |
| GET | `/categories` | Category list + counts |

### Cart & Booking (customer)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings/quote` | Price breakdown without creating anything |
| POST | `/bookings/checkout` | Creates hold + pending booking + payment order |
| GET | `/bookings` | My bookings |
| GET | `/bookings/{id}` | Booking detail |
| POST | `/bookings/{id}/cancel` | Cancel with refund calculation |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/verify` | Verify Razorpay signature |
| POST | `/payments/webhook` | Razorpay webhook |
| POST | `/payments/mock-confirm` | **Demo-only** fallback when gateway keys are unavailable (guarded by env flag) |

### Admin (role = admin)
| Method | Endpoint | Description |
|---|---|---|
| POST/PUT/DELETE | `/admin/costumes` | Create/update/archive costume |
| POST | `/admin/costumes/{id}/images` | Upload images (to Cloudinary) |
| GET | `/admin/bookings` | All bookings, filter by status/date |
| PATCH | `/admin/bookings/{id}/status` | confirm / picked_up / returned / cancelled |
| POST | `/admin/bookings/{id}/return` | Record return, damage/late fees, deposit refund |
| GET | `/admin/dashboard` | KPIs: revenue, active rentals, upcoming pickups, popular costumes |
| GET | `/admin/calendar` | Month view of bookings |
| POST/DELETE | `/admin/blackouts` | Manage blackout dates |

### Utility
`GET /health` (for hosting health checks), `POST /admin/seed` (demo reset; protected).

---

## 8. Frontend Architecture (React)

### Pages / Routes
| Route | Page |
|---|---|
| `/` | Home: hero, featured costumes, categories, how-it-works, about Yakshagana |
| `/costumes` | Catalogue with filters + date-availability filter |
| `/costumes/:id` | Detail, gallery, availability calendar, slot picker, "Add to booking" |
| `/cart` | Booking cart with date/slot per item |
| `/checkout` | Event details, pickup/delivery, payment |
| `/booking/success/:code` | Confirmation page |
| `/login`, `/register` | Auth |
| `/account/bookings` | My bookings + cancel |
| `/admin` | Dashboard |
| `/admin/costumes` | Inventory CRUD |
| `/admin/bookings` | Bookings management + calendar |
| `/about`, `/contact`, `/terms` | Static pages |

### Folder structure
```
frontend/
├── src/
│   ├── api/            # axios instance, per-resource API functions
│   ├── components/     # UI components (CostumeCard, SlotPicker, Calendar...)
│   ├── features/       # auth, catalogue, booking, admin (feature-based)
│   ├── hooks/          # useAuth, useAvailability, useCart
│   ├── pages/
│   ├── routes/         # ProtectedRoute, AdminRoute
│   ├── store/          # cart state (Zustand or Context)
│   ├── lib/            # formatters, date utils
│   └── main.tsx
├── .env                # VITE_API_BASE_URL, VITE_RAZORPAY_KEY_ID
└── vite.config.ts
```

### State & data
- **Server state:** TanStack Query (caching, refetch availability)
- **Client state:** Zustand/Context for cart + auth token
- **Forms:** React Hook Form + Zod validation

### UX notes for the demo
- Culturally themed design (deep reds, golds, black; Yakshagana imagery) — high-quality photos matter more than anything else
- Mobile-first (most users will open the shared link on a phone)
- Availability calendar showing blocked dates in grey
- Clear price breakdown (rent + deposit) before payment
- English + Kannada language toggle (nice-to-have; use `react-i18next`)

---

## 9. Backend Architecture (FastAPI)

### Folder structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router include
│   ├── core/
│   │   ├── config.py        # Pydantic Settings (env vars)
│   │   ├── security.py      # JWT, password hashing
│   │   └── deps.py          # get_current_user, require_admin
│   ├── db/
│   │   ├── mongo.py         # Motor client, init, indexes
│   │   └── seed.py          # Demo data loader
│   ├── models/              # Beanie/Pydantic DB models
│   ├── schemas/             # Request/response models
│   ├── routers/
│   │   ├── auth.py
│   │   ├── costumes.py
│   │   ├── bookings.py
│   │   ├── payments.py
│   │   └── admin.py
│   ├── services/
│   │   ├── availability.py  # overlap + stock logic
│   │   ├── pricing.py
│   │   ├── booking.py
│   │   ├── payment.py       # Razorpay wrapper
│   │   ├── email.py
│   │   └── storage.py       # Cloudinary wrapper
│   └── tasks/               # expire holds, reminders (APScheduler)
├── tests/                   # pytest: availability + pricing are the key ones
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Key backend decisions
- **Async everywhere** (Motor) for good performance on free tiers
- **Layered design:** routers → services → DB, so business rules (availability, pricing) are testable
- **CORS:** allow only the frontend's public URL (+ `localhost:5173` for dev)
- **Rate limiting:** `slowapi` on auth endpoints
- **Background jobs:** APScheduler for expiring unpaid bookings and sending reminder emails (1 day before pickup)
- **Logging & errors:** structured JSON logs, consistent error format `{ "detail": "...", "code": "..." }`

### Security checklist
- Passwords hashed with bcrypt; JWT with short expiry (e.g., 60 min) + refresh optional
- Role-based guards on admin routes
- Server-side price calculation only
- Razorpay signature verification + webhook secret
- Input validation via Pydantic; image upload type/size limits
- Secrets only in environment variables (never in git)
- HTTPS enforced by hosting platforms

---

## 10. External Requirements & Services Checklist

| # | Requirement | Service | Cost (demo) | What you need to do |
|---|---|---|---|---|
| 1 | Database | MongoDB Atlas M0 | Free | Create cluster, DB user, allow network access (`0.0.0.0/0` for demo), copy connection string |
| 2 | Backend hosting | Render (Web Service, Docker or Python) | Free tier (sleeps after inactivity) | Connect GitHub repo, set env vars, set start command |
| 3 | Frontend hosting | Vercel / Netlify | Free | Connect repo, set `VITE_API_BASE_URL` |
| 4 | Image hosting | Cloudinary | Free | Create account, get cloud name/key/secret |
| 5 | Payments | Razorpay (test mode) | Free | Create account, generate **test** key id/secret, set webhook |
| 6 | Email | Resend / Brevo / Gmail SMTP | Free | API key or app password; verify sender |
| 7 | Source control | GitHub (private repo) | Free | Needed for auto-deploys |
| 8 | Domain (optional) | Any registrar | ~₹700–1000/yr | Custom URL looks more professional than `*.vercel.app` |
| 9 | Keep-alive (free tier) | UptimeRobot / cron-job.org | Free | Ping `/health` every 5 min so Render doesn't cold-start during the demo |
| 10 | Error monitoring (optional) | Sentry | Free | DSN in env |
| 11 | WhatsApp/SMS notifications (optional) | Twilio / Gupshup / MSG91 | Paid/trial | Optional upgrade; skip for demo |
| 12 | Content & assets | — | — | **From client:** real costume photos, names (Kannada + English), prices, stock counts, sizes, policies, logo, brand colours |

### Environment variables
**Backend (`.env`)**
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=yakshagana_rentals
JWT_SECRET=change-me
JWT_EXPIRE_MINUTES=60
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
EMAIL_API_KEY=...
EMAIL_FROM=bookings@yourdomain.com
HOLD_MINUTES=10
ENABLE_MOCK_PAYMENT=true
ADMIN_SEED_EMAIL=admin@demo.com
ADMIN_SEED_PASSWORD=...
```
**Frontend (`.env`)**
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## 11. Deployment & Temporary Hosting Plan

### Option A — Recommended (stable public links, ~30 min setup)
1. **Atlas:** create free cluster → connection string.
2. **GitHub:** push `frontend/` and `backend/` (monorepo or two repos).
3. **Render:** New Web Service → backend → build `pip install -r requirements.txt` → start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` → add env vars.
4. **Seed data:** run `POST /admin/seed` (or a seed script) once.
5. **Vercel/Netlify:** import frontend → set `VITE_API_BASE_URL` → deploy.
6. Update backend `CORS_ORIGINS` with the final frontend URL.
7. Test the full flow, then share the Vercel link with the client.

### Option B — Fastest, fully temporary (run locally, expose with a tunnel)
- Run backend + frontend locally (or via Docker Compose), then:
  - `cloudflared tunnel --url http://localhost:5173` (or ngrok) → public temporary URL.
- Good for a live screen-share demo; link dies when your laptop sleeps/closes.

### Option C — Lovable for the UI
- Generate the React UI in Lovable, publish it, and connect it to the Render-hosted FastAPI backend via the API base URL. Remember to add the Lovable domain to CORS.

### Docker (optional but clean)
```
docker-compose.yml
 ├── backend  (FastAPI)
 ├── frontend (Vite build served by nginx)
 └── mongo    (local dev only; Atlas in the hosted demo)
```

### Demo-day tips
- Warm up the Render backend 5 minutes before the demo (free tier cold start ~30–60 s)
- Pre-create demo accounts: `customer@demo.com` and `admin@demo.com`
- Use Razorpay **test cards/UPI** (from Razorpay docs); keep `ENABLE_MOCK_PAYMENT` as a safety net
- Have a "Reset demo data" button/endpoint for the admin
- Keep a short screen-recording as a backup if the network fails

---

## 12. Seed / Demo Data Plan
- 6–8 categories, **30–50 costumes** with real-looking names, 2–4 images each, varied prices/stock
- A few pre-existing bookings so the availability calendar visibly shows blocked dates
- 1 admin, 2–3 customers
- 1 fully "returned" booking with deposit refund to show the complete lifecycle
- Sample reviews on popular items

---

## 13. Testing Strategy
| Level | Tool | Focus |
|---|---|---|
| Unit | pytest | Overlap logic, buffer, pricing, cancellation refund |
| API | pytest + httpx AsyncClient + mongomock/test DB | Booking flow, double-booking prevention |
| E2E | Playwright | Browse → select slot → pay (mock) → confirmation |
| Manual | Checklist | Mobile browsers, slow network, expired hold |

**Critical test:** two simultaneous checkout requests for the last unit → exactly one succeeds.

---

## 14. Suggested Build Plan (≈ 2 weeks for a polished demo)

| Phase | Days | Deliverables |
|---|---|---|
| 0. Setup | 1 | Repos, Atlas, env, CI/auto-deploy skeleton, design theme |
| 1. Catalogue | 2–3 | Models, seed data, list/detail APIs, catalogue UI, filters |
| 2. Auth | 1 | Register/login, protected routes |
| 3. Booking core | 3–4 | Availability service, calendar UI, cart, checkout, holds |
| 4. Payments & email | 2 | Razorpay test flow, webhook, confirmation email |
| 5. My bookings + cancel | 1 | Customer account area |
| 6. Admin panel | 2–3 | Inventory CRUD, booking management, dashboard |
| 7. Polish & deploy | 2 | Responsive fixes, Kannada toggle (optional), tests, deploy, demo script |

*(Compress to ~1 week by cutting admin dashboard charts, reviews, and i18n.)*

---

## 15. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Free-tier cold starts slow the demo | Keep-alive pinger + warm up before meeting |
| Double booking | Holds with TTL + transactional re-check + test |
| Payment gateway issues | Mock-confirm fallback behind env flag |
| Missing real photos/content | Request early from client; use quality placeholders meanwhile |
| Timezone bugs | Store UTC, display in IST (`Asia/Kolkata`) |
| Scope creep | Freeze the "In scope" list in Section 1 and log extras in the roadmap |

---

## 16. Post-Demo Roadmap
- Production payments, GST invoices, refund automation
- Delivery/pickup scheduling & courier integration
- WhatsApp/SMS reminders
- Troupe (group) accounts and bulk bookings for entire performances
- Damage inspection with photo upload at return
- Inventory analytics, maintenance scheduling
- Multi-vendor support (multiple costume owners)
- Mobile app (React Native) / PWA install

---

## 17. Open Questions for the Client
1. Rental by **day**, by **slot**, or both? What are the slot timings?
2. Are costumes rented as **full sets**, **individual pieces**, or both?
3. Deposit amounts, late fees, and cancellation policy?
4. Pickup only, or delivery as well? Service area?
5. Do customers need to be **verified** (ID/phone OTP) before booking?
6. Should one booking support multiple costumes for different dates?
7. Languages needed (English / Kannada / Tulu)?
8. Who manages inventory — one admin or multiple staff roles?
9. Real photos and catalogue data — who provides and by when?
10. Is online payment mandatory, or can bookings be "request & pay at pickup"?

---

*Document version: 1.0 — prepared for the client demo build.*
