# DevSecure - Web Vulnerability Scanner

DevSecure is a full-stack application that scans a target website URL and reports basic security findings.

## Tech Stack

- Backend: Node.js, Express, Axios, Helmet, CORS, portscanner, pdfkit
- Frontend: React (Vite), Tailwind CSS, Axios

## Project Structure

DevSecure
- backend
  - routes
  - controllers
  - services
  - utils
  - server.js
  - package.json
- frontend
  - src
    - components
    - pages
    - App.jsx
    - main.jsx
  - package.json

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

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

## API Endpoints

- `POST /api/scan`
  - Body:
    ```json
    {
      "url": "https://example.com"
    }
    ```
- `GET /api/report`
  - Downloads the latest scan report as PDF
