import { useState } from 'react';
import axios from 'axios';
import ScanForm from '../components/ScanForm';
import ResultCard from '../components/ResultCard';
import SecurityScore from '../components/SecurityScore';
import PortList from '../components/PortList';
import LoadingSpinner from '../components/LoadingSpinner';

const normalizeUrlInput = (input) => {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidUrl = (input) => {
  try {
    const candidate = normalizeUrlInput(input);
    const parsed = new URL(candidate);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
};

function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (event) => {
    event.preventDefault();

    if (!url.trim() || !isValidUrl(url)) {
      setError('Please enter a valid URL. Example: https://example.com');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Scan request goes to backend proxy (/api -> localhost:5000).
      const response = await axios.post('/api/scan', { url: url.trim() });
      setResult(response.data);
    } catch (scanError) {
      const message = scanError.response?.data?.message || 'Scan failed. Please try again.';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get('/api/report', { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `devsecure-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      const message = downloadError.response?.data?.message || 'Unable to download PDF report.';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-xl backdrop-blur md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slatebrand-700">Security Intelligence</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            DevSecure - Web Vulnerability Scanner
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Analyze a website for missing security headers, potentially unsafe script patterns, and common open ports.
          </p>

          <ScanForm url={url} onUrlChange={setUrl} onSubmit={handleScan} loading={loading} />

          {loading && (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <LoadingSpinner />
              Running vulnerability checks...
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
        </section>

        {result && (
          <section className="space-y-5 animate-slide-up">
            <div className="grid gap-5 md:grid-cols-2">
              <ResultCard title="Security Score">
                <SecurityScore score={result.securityScore} riskLevel={result.riskLevel} />
              </ResultCard>

              <ResultCard title="Scan Summary">
                <dl className="space-y-2 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold">Scanned URL</dt>
                    <dd className="break-all text-slate-600">{result.url}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Risk Level</dt>
                    <dd>{result.riskLevel}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Scanned At</dt>
                    <dd>{new Date(result.scannedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </ResultCard>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <ResultCard title="Detected Vulnerabilities">
                {result.issues.length ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {result.issues.map((issue, index) => (
                      <li key={`${issue}-${index}`} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                        {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">No obvious vulnerabilities detected in this basic scan.</p>
                )}
              </ResultCard>

              <ResultCard title="Open Ports">
                <PortList ports={result.openPorts} />
              </ResultCard>
            </div>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download PDF Report
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export default HomePage;
