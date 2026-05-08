# 💊 Medication Management System

A full-stack web app for nursing staff to track and administer patient medications across morning, afternoon, and evening time slots.

> Built as part of the YAP Engineering Interview Assignment — May 2026

---

## 🧠 How It Works

```
NURSE (Browser) → FRONTEND (Next.js) → BACKEND (Express) → DATABASE (Supabase)
   clicks "Give"     sends request        processes it        saves the record
```

- **Frontend** — what the nurse sees and clicks
- **Backend** — the brain that handles logic and rules
- **Supabase** — where all patient and medication data is stored

---

##  Features

-  Add and manage patients with room numbers
-  Assign multiple medications per patient
-  Set morning, afternoon, and evening schedules per medication
-  Mark doses as administered — logged with nurse's name
-  Prevents the same dose from being given twice
-  Live dashboard showing pending doses for the current time slot

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | Supabase (PostgreSQL) |

---




---

##  Setup Guide

### What You Need First

- [Node.js v18+](https://nodejs.org)
- [A free Supabase account](https://supabase.com)

---

### Step 1 — Set Up the Database (Supabase)

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Open the **SQL Editor** and run this script:

s
CREATE TABLE medication_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  status TEXT DEFAULT 'administered',
  administered_at TIMESTAMPTZ DEFAULT NOW(),
  administered_by TEXT NOT NULL,
  UNIQUE(medication_id, patient_id, date, time_slot)
);
```

3. Go to **Project Settings → API** and copy your:
   - `Project URL`
   - `service_role` secret key

---

### Step 2 — Run the Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

Start the server:

```bash
npm run dev
#  Backend running at http://localhost:3001
```

---

### Step 3 — Run the Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
# Frontend running at http://localhost:3000
```

Open **http://localhost:3000** in your browser. 

>  Both the backend and frontend terminals must be running at the same time.

---

##  Setup Checklist

- [ ] Create Supabase project
- [ ] Run the 3 SQL table scripts
- [ ] Copy Supabase URL and service key
- [ ] Add keys to `backend/.env`
- [ ] `npm install` + `npm run dev` in `/backend`
- [ ] Add API URL to `frontend/.env.local`
- [ ] `npm install` + `npm run dev` in `/frontend`
- [ ] Open `http://localhost:3000`

---

## 📡 API Reference

### Patients
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients` | Get all patients + medications |
| `GET` | `/api/patients/:id` | Get a single patient |
| `POST` | `/api/patients` | Create a new patient |
| `PUT` | `/api/patients/:id` | Update a patient |
| `DELETE` | `/api/patients/:id` | Delete patient + their medications |

### Medications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/medications` | Add medication to a patient |
| `PUT` | `/api/medications/:id` | Update a medication |
| `DELETE` | `/api/medications/:id` | Delete a medication |
| `POST` | `/api/medications/administer` | Mark a dose as given |

### Schedule
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schedule/today` | Get schedule for current time slot |

---

## 🕐 Time Slot Logic

The app automatically detects the current time slot:

| Time | Slot |
|---|---|
| 12:00 AM – 11:59 AM | Morning |
| 12:00 PM – 4:59 PM |  Afternoon |
| 5:00 PM – 11:59 PM |  Evening |

---

##  Contributing

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# Then open a Pull Request
```

---

##  License

MIT License
