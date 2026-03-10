# DevSecure – AI Powered Web Security Scanner

DevSecure is a full-stack cybersecurity tool that scans websites for common security issues and uses AI to analyze vulnerabilities, explain risks, and recommend fixes.

The system helps developers understand security weaknesses in their web applications by generating automated reports and AI-powered insights.

---

## Features

• Automated website security scanning
• AI powered vulnerability explanations
• AI generated security recommendations
• Security risk scoring system
• Interactive cybersecurity AI assistant
• Downloadable PDF security report
• Modern dashboard with data visualizations

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios
* Recharts
* tsparticles
* lucide-react

### Backend

* Node.js
* Express.js
* Axios
* PDF Report Generation

### AI Integration

* Groq API
* Llama 3.1 AI Model

### Deployment

* Frontend deployed on Vercel
* Backend deployed on Render

---

## System Architecture

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

## AI Capabilities

### AI Security Summary

Generates a quick summary of scan results including:

• risk level
• detected vulnerabilities
• overall security score
• immediate remediation actions

### AI Vulnerability Explanation

Explains each detected vulnerability:

• what the vulnerability means
• how attackers exploit it
• impact on the system
• recommended fix

### AI Recommendations

Provides structured security remediation steps.

### AI Security Chat

Interactive assistant that answers cybersecurity questions and explains security concepts.

---

## Example Use Case

1. Enter a website URL
2. DevSecure scans the website
3. Vulnerabilities and security issues are detected
4. AI analyzes results and explains risks
5. A security report is generated for developers

---

## Installation (Local Setup)

Clone repository

git clone https://github.com/yourusername/devsecure.git

Install dependencies

Frontend

cd frontend
npm install

Backend

cd backend
npm install

Run backend

node server.js

Run frontend

npm run dev

---

## Environment Variables

Backend

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

Frontend

VITE_API_BASE_URL=http://localhost:5000

---

## Future Improvements

• OWASP Top-10 vulnerability classification
• Historical scan tracking
• Security trend dashboard
• Real-time scan progress indicator

---

## Author

Vivek Kumar
Computer Science Student
Cybersecurity Enthusiast
