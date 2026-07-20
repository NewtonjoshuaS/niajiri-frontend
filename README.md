# Niajiri Frontend

> React + Vite Employer Portal & NiaBot Candidate Chat for the Niajiri Recruitment Platform.

**Developer:** Newton Joshua Sinda — [github.com/NewtonjoshuaS](https://github.com/NewtonjoshuaS)

This is the **frontend** repository. The backend API lives at [github.com/NewtonjoshuaS/niajiri-backend](https://github.com/NewtonjoshuaS/niajiri-backend).

---

## What This App Has

| Route | Page | Who Uses It |
|---|---|---|
| `/` | Employer Portal (Login / Dashboard) | Employers & HR teams |
| `/chat` | NiaBot Candidate Chat | Job seekers |
| `/status` | Application Status Tracker | Candidates checking progress |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Backend API running (see [niajiri-backend](https://github.com/NewtonjoshuaS/niajiri-backend))

### Setup
```bash
git clone https://github.com/NewtonjoshuaS/niajiri-frontend.git
cd niajiri-frontend

# Copy and configure environment
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Environment Variable

```env
# .env
VITE_API_URL=http://localhost:5000/api
```

For production (Vercel), set this to your Render backend URL:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## How to Use the Employer Portal

1. Go to `/` and log in with your employer credentials
   - **Demo:** `employer@niajiri.co.tz` / `Password123!`
2. The **Dashboard** shows:
   - Metrics: Open roles, Closed roles, Applicants, Shortlisted
   - **Job Form** (left): Create or edit job listings with custom screening questions
   - **Your Jobs** (right): Manage existing roles — edit, close/reopen, delete
   - **Recent Applications** (below): View all candidates, update their status, download CVs

---

## How to Use NiaBot (Candidate Chat)

1. Go to `/chat`
2. Click on an open job listing to select it
3. Fill in your name, WhatsApp phone, optional email, and optionally upload your CV
4. Click **Start application**
5. Chat with NiaBot — answer each screening question one by one
6. On completion: *"Your application has been submitted successfully"*

---

## How to Check Application Status

1. Go to `/status`
2. Enter your **phone number** or **email** used when applying
3. Click **Check Status**
4. See your stepper progress: Applied → Reviewing → Shortlist → Interview → Hired/Rejected

---

## Build for Production

```bash
npm run build
# Output in dist/
```

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Build Command: `npm run build` | Output Directory: `dist`
5. Deploy ✅

---

## Docker

```bash
docker build -t niajiri-frontend .
docker run -p 5173:5173 -e VITE_API_URL=http://localhost:5000/api niajiri-frontend
```

---

## License
MIT © Newton Joshua Sinda
