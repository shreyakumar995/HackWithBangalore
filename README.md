# 🛡️ Internship Legitimacy Scorer

An AI-powered web application that helps students detect fraudulent internship offers and "pay-to-intern" scams. Upload screenshots or paste internship details, and get an instant legitimacy score powered by Groq's LLM inference.

---

## 🎯 How It Works

The system evaluates internship opportunities on a strict **0–100 scale** across four pillars:

| Pillar | Max Points | What It Checks |
|---|---|---|
| **Financial Structure** | 35 | Clear stipend vs. fees charged to students |
| **Digital Footprint** | 25 | Online reviews, verified address, LinkedIn presence |
| **Recruitment Process** | 20 | Corporate email domains, multi-step interviews |
| **Marketing Substance** | 20 | Real responsibilities vs. FOMO tactics / fake guarantees |

> **Critical Red Flag Rule**: If ANY critical red flag is detected (e.g., student is asked to pay fees), the score is **capped at 30/100** regardless of other factors.

### Verdict Thresholds

- 🟢 **71–100**: LEGITIMATE
- 🟡 **41–70**: SUSPICIOUS
- 🔴 **21–40**: LIKELY SCAM
- ⛔ **0–20**: DEFINITE SCAM

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS v4, Axios |
| Backend | Node.js, Express.js, Multer |
| AI Engine | Groq API (LLaMA 3 70B) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- A **Groq API Key** — get one free at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ITS
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file (or edit the existing one) and add your Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

> The frontend dev server is pre-configured to proxy `/api` requests to the backend on port 5000, so everything works seamlessly.

---

## 📁 Project Structure

```
ITS/
├── backend/
│   ├── server.js          # Express server + Groq integration
│   ├── .env               # Environment variables (your API key goes here)
│   ├── .env.example        # Template for .env
│   ├── package.json
│   └── uploads/            # Temporary file uploads (auto-cleaned)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Entry point
│   │   ├── index.css       # Global styles + Tailwind
│   │   └── components/
│   │       ├── Header.jsx      # App header
│   │       ├── UploadZone.jsx  # Drag-and-drop file upload
│   │       ├── ScoreGauge.jsx  # Animated circular score gauge
│   │       └── ResultsPanel.jsx # Results display with breakdowns
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key |
| `PORT` | ❌ | Backend port (default: 5000) |

---

## 📸 Features

- **Drag & Drop Upload** — Upload up to 5 screenshots of internship ads, emails, or company pages
- **Text Analysis** — Paste company names, descriptions, email content, or URLs
- **Animated Score Gauge** — Visual circular gauge with color-coded scoring
- **Detailed Breakdown** — See scores for each evaluation pillar
- **Green/Red Flags** — Clear list of positive and negative indicators
- **Actionable Advice** — AI-generated recommendations for the student
- **Responsive Design** — Works on desktop and mobile
- **Dark Mode** — Premium dark UI with glassmorphism effects

---

## ⚠️ Disclaimer

This tool provides **AI-generated advisory analysis** and should not be considered definitive legal or financial advice. Always conduct your own research before committing to any internship opportunity.

---

## 📝 License

MIT License — free to use and modify.
