# DevSecure - Web Vulnerability Scanner (Phase-3)

DevSecure is a full-stack cybersecurity dashboard with scanner + AI-assisted analysis.

## Tech Stack

- Backend: Node.js, Express, Axios, Helmet, CORS, portscanner, pdfkit, dotenv
- Frontend: React (Vite), Tailwind CSS (Vite plugin), Axios, Recharts, react-circular-progressbar, Framer Motion

## Environment Setup (Required for AI)

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Optional:

```env
OPENAI_MODEL=gpt-4.1-mini
```

`backend/.env` is ignored in `.gitignore`.

## Backend API

### Scan APIs

- `POST /api/scan`
- `GET /api/report`

### AI APIs

- `POST /api/ai/explain`
  - Body:
    ```json
    { "vulnerability": "Missing Content Security Policy" }
    ```
- `POST /api/ai/summary`
  - Body:
    ```json
    { "url": "https://example.com", "issues": [], "score": 72 }
    ```
- `POST /api/ai/recommend`
  - Body:
    ```json
    { "issues": [] }
    ```
- `POST /api/ai/chat`
  - Body:
    ```json
    { "message": "How dangerous is missing CSP?" }
    ```

## Dashboard Features

- Security score gauge
- Severity pie chart
- Security headers status panel
- Vulnerability list with AI explain modal
- AI security summary card
- AI security recommendations
- Security assistant chat panel
- Animated cyber background
- Clickable recent scans that reload full stored scan objects

## Run Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:5000`.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to backend.