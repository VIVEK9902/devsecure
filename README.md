# DevSecure – AI Powered Web Security Scanner

DevSecure is a full-stack cybersecurity tool that scans websites for common security issues and uses Artificial Intelligence to analyze vulnerabilities, explain risks, and recommend fixes.

The system helps developers understand security weaknesses in their web applications by generating automated reports and AI-powered insights.

---

# Features

• Automated website security scanning
• AI powered vulnerability explanation
• AI generated security recommendations
• Interactive cybersecurity AI assistant
• Security risk scoring system
• Visual dashboard with security metrics
• Downloadable PDF security report
• Modern responsive UI

---

# Tech Stack

## Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios
* Recharts
* tsparticles
* lucide-react

## Backend

* Node.js
* Express.js
* Axios
* PDF Report Generation

## AI Integration

* Groq API
* Llama-3.1 AI Model

## Deployment

Frontend → Vercel
Backend → Render

---

# System Architecture

User
↓
Frontend (React + Vite)
↓
Backend API (Node.js + Express)
↓
Groq LLM (AI Analysis)
↓
Security Insights + Report

---

# AI Capabilities

## AI Security Summary

Generates a quick overview of scan results including:

• overall security score
• risk level
• detected vulnerabilities
• immediate remediation steps

---

## AI Vulnerability Explanation

Explains each detected vulnerability:

• what the vulnerability means
• how attackers exploit it
• impact on the system
• recommended fix

---

## AI Recommendations

Generates structured security remediation suggestions for developers.

---

## AI Security Chat

Interactive assistant capable of answering cybersecurity questions and explaining vulnerabilities.

---

# Project Structure

```
DevSecure
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   └── App.jsx
│
├── backend
│   ├── routes
│   │   ├── scanRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── services
│   │   └── aiService.js
│   │
│   └── server.js
│
└── README.md
```

---

# API Endpoints

## Health Check

GET /api/health

---

## Website Scan

POST /api/scan

Runs a security scan on the provided website.

---

## AI Security Summary

POST /api/ai/summary

Returns AI generated summary of scan results.

---

## AI Vulnerability Explanation

POST /api/ai/explain

Provides explanation and mitigation for vulnerabilities.

---

## AI Security Recommendations

POST /api/ai/recommendations

Returns security improvement suggestions.

---

## AI Security Chat

POST /api/ai/chat

Cybersecurity assistant endpoint.

---

# Local Setup

Clone repository

```
git clone https://github.com/yourusername/devsecure.git
```

---

## Backend Setup

```
cd backend
npm install
node server.js
```

Backend runs on

```
http://localhost:5000
```

---

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Environment Variables

## Backend

Create a `.env` file in backend folder.

```
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
PORT=5000
```

---

## Frontend

Create `.env` in frontend folder.

```
VITE_API_BASE_URL=http://localhost:5000
```

For production deployment:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

---

# Deployment

## Frontend

Frontend is deployed using **Vercel**.

Features include:

• automatic GitHub deployment
• environment variable configuration
• global CDN hosting

---

## Backend

Backend is deployed using **Render**.

Deployment includes:

• environment variable configuration
• automated builds from GitHub
• API health monitoring

---

# Example Workflow

1. User enters a website URL
2. DevSecure scans the website
3. Security vulnerabilities are detected
4. AI analyzes the results
5. Security report is generated

---

# Future Improvements

• OWASP Top-10 vulnerability classification
• Historical scan tracking
• Security trend dashboard
• Real-time scan progress indicator

---

# Author

Vivek Kumar
Computer Science Student
Cybersecurity Enthusiast
