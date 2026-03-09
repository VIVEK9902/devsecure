import { useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import ScanForm from '../components/ScanForm';
import ResultCard from '../components/ResultCard';
import PortList from '../components/PortList';
import SecurityGauge from '../components/SecurityGauge';
import SecurityHeadersCard from '../components/SecurityHeadersCard';
import VulnerabilityChart from '../components/VulnerabilityChart';
import RecommendationsCard from '../components/RecommendationsCard';
import ScanHistory from '../components/ScanHistory';
import ScanProgress from '../components/ScanProgress';
import AISummaryCard from '../components/AISummaryCard';
import AIExplanationModal from '../components/AIExplanationModal';
import SecurityChat from '../components/SecurityChat';
import { API_BASE_URL } from '../config/api';

const SCAN_STAGES = [
  'Scanning target',
  'Checking headers',
  'Detecting vulnerabilities',
  'Running AI analysis',
  'Scan complete',
];

const HISTORY_STORAGE_KEY = 'devsecure_recent_scans';

const normalizeUrlInput = (input) => {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidUrl = (input) => {
  try {
    const candidate = normalizeUrlInput(input);
    const parsed = new URL(candidate);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const loadScanHistory = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveScanHistory = (history) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }
};

const normalizeBulletPoints = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).replace(/^[-*\s]+/, '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split('\n')
    .map((line) => line.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean);
};

const getSecurityGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const normalizeIssue = (issue) => {
  if (typeof issue === 'string') {
    return {
      title: issue,
      severity: 'Medium',
      category: 'General',
      owaspCategory: 'A05 Security Misconfiguration',
      owasp: 'A05 Security Misconfiguration',
    };
  }

  const owasp = issue.owaspCategory || issue.owasp || 'A05 Security Misconfiguration';

  return {
    ...issue,
    title: issue.title || issue.name || 'Unknown issue',
    severity: issue.severity || 'Medium',
    category: issue.category || 'General',
    owaspCategory: owasp,
    owasp,
  };
};

const getSeverityCounts = (issues, apiSeverityCounts) => {
  if (apiSeverityCounts && typeof apiSeverityCounts.high === 'number') {
    return apiSeverityCounts;
  }

  return issues.reduce(
    (accumulator, issue) => {
      const severityKey = (issue.severity || 'Medium').toLowerCase();
      if (severityKey in accumulator) {
        accumulator[severityKey] += 1;
      }
      return accumulator;
    },
    { high: 0, medium: 0, low: 0 }
  );
};

const normalizeScanResult = (scanObject) => {
  const issues = Array.isArray(scanObject.issues) ? scanObject.issues.map(normalizeIssue) : [];
  const securityScore = typeof scanObject.securityScore === 'number' ? scanObject.securityScore : 0;

  return {
    url: scanObject.url || '',
    securityScore,
    securityGrade: scanObject.securityGrade || getSecurityGrade(securityScore),
    riskLevel: scanObject.riskLevel || 'Unknown',
    issues,
    openPorts: Array.isArray(scanObject.openPorts) ? scanObject.openPorts : [],
    securityHeaders: Array.isArray(scanObject.securityHeaders)
      ? scanObject.securityHeaders
      : Array.isArray(scanObject.headers)
      ? scanObject.headers
      : [],
    recommendations: Array.isArray(scanObject.recommendations) ? scanObject.recommendations : [],
    severityCounts: getSeverityCounts(issues, scanObject.severityCounts),
    aiSummaryPoints: normalizeBulletPoints(
      scanObject.aiSummaryPoints || scanObject.aiSummary || scanObject.summary
    ),
    aiRecommendations: normalizeBulletPoints(scanObject.aiRecommendations || []),
    scannedAt: scanObject.timestamp || scanObject.scannedAt || new Date().toISOString(),
  };
};

const mapStoredScanToResult = (scanObject) => normalizeScanResult(scanObject);

const buildStoredScanObject = (scanResult, aiSummaryPoints, aiRecommendations) => ({
  url: scanResult.url,
  securityScore: scanResult.securityScore,
  securityGrade: scanResult.securityGrade,
  riskLevel: scanResult.riskLevel,
  issues: scanResult.issues || [],
  openPorts: scanResult.openPorts || [],
  headers: scanResult.securityHeaders || [],
  securityHeaders: scanResult.securityHeaders || [],
  recommendations: scanResult.recommendations || [],
  severityCounts: scanResult.severityCounts || { high: 0, medium: 0, low: 0 },
  aiSummaryPoints,
  aiRecommendations,
  timestamp: scanResult.scannedAt || new Date().toISOString(),
});

const getRiskLevelClasses = (riskLevel, isDark) => {
  if (riskLevel === 'Low') {
    return isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700';
  }

  if (riskLevel === 'Medium') {
    return isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
  }

  return isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700';
};

const getSeverityClasses = (severity, isDark) => {
  const normalizedSeverity = severity || 'Medium';

  if (normalizedSeverity === 'High') {
    return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
  }

  if (normalizedSeverity === 'Medium') {
    return isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
  }

  return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
};

const getGradeClasses = (grade, isDark) => {
  if (['A+', 'A'].includes(grade)) {
    return isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700';
  }

  if (grade === 'B') {
    return isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700';
  }

  if (grade === 'C') {
    return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
  }

  if (grade === 'D') {
    return isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
  }

  return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
};

function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanStage, setScanStage] = useState(0);
  const [showScanProgress, setShowScanProgress] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [scanHistory, setScanHistory] = useState(() => loadScanHistory());

  const [aiSummaryPoints, setAiSummaryPoints] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [explanationModal, setExplanationModal] = useState({
    isOpen: false,
    issue: '',
    loading: false,
    data: null,
    error: '',
  });

  const isDark = theme === 'dark';

  const issues = useMemo(() => (result?.issues || []).map(normalizeIssue), [result]);
  const severityCounts = useMemo(
    () => getSeverityCounts(issues, result?.severityCounts),
    [issues, result?.severityCounts]
  );

  const securityHeaders = result?.securityHeaders || [];
  const openPorts = result?.openPorts || [];

  const combinedRecommendations = useMemo(() => {
    const fromScan = Array.isArray(result?.recommendations) ? result.recommendations : [];
    return Array.from(new Set([...fromScan, ...aiRecommendations]));
  }, [result, aiRecommendations]);

  const loadScanResult = (scanObject) => {
    const mappedResult = mapStoredScanToResult(scanObject);
    setResult(mappedResult);
    setUrl(mappedResult.url || '');
    setAiSummaryPoints(mappedResult.aiSummaryPoints);
    setAiRecommendations(mappedResult.aiRecommendations);
    setAiError('');
    setError('');
  };

  const generateAIInsights = async (scanPayload) => {
    setAiLoading(true);
    setAiError('');

    let summaryPoints = [];
    let recommendationList = [];

    try {
      const [summaryResponse, recommendationResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/ai/summary`, {
          url: scanPayload.url,
          issues: scanPayload.issues || [],
          score: scanPayload.securityScore || 0,
        }),
        axios.post(`${API_BASE_URL}/api/ai/recommend`, {
          issues: scanPayload.issues || [],
        }),
      ]);

      summaryPoints = normalizeBulletPoints(summaryResponse.data?.summary).slice(0, 8);
      recommendationList = normalizeBulletPoints(recommendationResponse.data?.recommendations).slice(0, 10);

      setAiSummaryPoints(summaryPoints);
      setAiRecommendations(recommendationList);
    } catch (aiRequestError) {
      const message =
        aiRequestError.response?.data?.message ||
        'AI insights are unavailable. Verify local Ollama is running with mistral.';
      setAiError(message);
      setAiSummaryPoints([]);
      setAiRecommendations([]);
      summaryPoints = [];
      recommendationList = [];
    } finally {
      setAiLoading(false);
    }

    return { summaryPoints, recommendationList };
  };

  const handleScan = async (event) => {
    event.preventDefault();

    if (!url.trim() || !isValidUrl(url)) {
      setError('Please enter a valid URL. Example: https://example.com');
      return;
    }

    let stageTimer;
    let hideProgressTimer;
    let scanSucceeded = false;

    try {
      setError('');
      setLoading(true);
      setScanStage(0);
      setShowScanProgress(true);
      setAiSummaryPoints([]);
      setAiRecommendations([]);
      setAiError('');

      stageTimer = window.setInterval(() => {
        setScanStage((current) => (current < 2 ? current + 1 : current));
      }, 850);

      const response = await axios.post(`${API_BASE_URL}/api/scan`, { url: url.trim() });
      const scanResult = normalizeScanResult(response.data);
      setResult(scanResult);
      scanSucceeded = true;

      if (stageTimer) {
        window.clearInterval(stageTimer);
        stageTimer = undefined;
      }

      setScanStage(3);
      const { summaryPoints, recommendationList } = await generateAIInsights(scanResult);
      setScanStage(4);

      const historyEntry = buildStoredScanObject(scanResult, summaryPoints, recommendationList);
      setScanHistory((previousHistory) => {
        const nextHistory = [historyEntry, ...previousHistory].slice(0, 10);
        saveScanHistory(nextHistory);
        return nextHistory;
      });
    } catch (scanError) {
      const message = scanError.response?.data?.message || 'Scan failed. Please try again.';
      setError(message);
    } finally {
      if (stageTimer) {
        window.clearInterval(stageTimer);
      }

      setLoading(false);

      if (scanSucceeded) {
        hideProgressTimer = window.setTimeout(() => {
          setShowScanProgress(false);
        }, 900);
      } else {
        setShowScanProgress(false);
      }

      // Prevent lint warnings for timer variable in strict mode.
      void hideProgressTimer;
    }
  };

  const handleRefreshAIInsights = async () => {
    if (!result || aiLoading) {
      return;
    }

    const { summaryPoints, recommendationList } = await generateAIInsights(result);
    const activeTimestamp = result.scannedAt;

    setScanHistory((currentHistory) => {
      const updatedHistory = currentHistory.map((entry) => {
        const entryTimestamp = entry.timestamp || entry.scannedAt;
        if (entry.url === result.url && entryTimestamp === activeTimestamp) {
          return {
            ...entry,
            aiSummaryPoints: summaryPoints,
            aiRecommendations: recommendationList,
          };
        }

        return entry;
      });

      saveScanHistory(updatedHistory);
      return updatedHistory;
    });
  };

  const handleExplainIssue = async (issueTitle) => {
    setExplanationModal({
      isOpen: true,
      issue: issueTitle,
      loading: true,
      data: null,
      error: '',
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/explain`, { vulnerability: issueTitle });
      setExplanationModal({
        isOpen: true,
        issue: issueTitle,
        loading: false,
        data: response.data,
        error: '',
      });
    } catch (explainError) {
      const message =
        explainError.response?.data?.message ||
        'Unable to fetch AI explanation. Check backend AI configuration.';
      setExplanationModal({
        isOpen: true,
        issue: issueTitle,
        loading: false,
        data: null,
        error: message,
      });
    }
  };

  const handleCloseExplanationModal = () => {
    setExplanationModal({
      isOpen: false,
      issue: '',
      loading: false,
      data: null,
      error: '',
    });
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

  const handleSelectHistoryScan = (scanObject) => {
    loadScanResult(scanObject);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    saveScanHistory([]);
  };

  const pageClasses = isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900';
  const topCardClasses = isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white';
  const mutedTextClasses = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground isDark={isDark} />

      <main className={`relative z-10 min-h-screen px-4 py-8 transition-colors ${pageClasses}`}>
        <div className="mx-auto max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-xl border p-6 shadow-lg backdrop-blur ${topCardClasses}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">SOC Dashboard</p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  DevSecure - AI Powered Web Security Scanner
                </h1>
                <p className={`mt-2 text-sm ${mutedTextClasses}`}>
                  Production-ready dashboard with vulnerability scanning, OWASP mapping, and local AI analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isDark
                    ? 'border border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>

            <ScanForm url={url} onUrlChange={setUrl} onSubmit={handleScan} loading={loading} isDark={isDark} />

            {showScanProgress ? (
              <ScanProgress stages={SCAN_STAGES} currentStage={scanStage} isDark={isDark} />
            ) : null}

            {error ? (
              <p
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {error}
              </p>
            ) : null}
          </motion.section>

          <section className="mt-6 grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ResultCard title="Security Score Gauge" subtitle="Score after weighted issue penalties" isDark={isDark}>
                <SecurityGauge
                  score={typeof result?.securityScore === 'number' ? result.securityScore : 0}
                  riskLevel={result?.riskLevel || 'Unknown'}
                  securityGrade={result?.securityGrade || 'F'}
                  isDark={isDark}
                />
              </ResultCard>
            </div>

            <div className="lg:col-span-8">
              <ResultCard
                title="Scan Summary"
                subtitle="Latest target analysis metadata"
                isDark={isDark}
                actions={
                  result ? (
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Download PDF Report
                    </button>
                  ) : null
                }
              >
                {result ? (
                  <dl className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Target URL</dt>
                      <dd className="mt-1 break-all">{result.url}</dd>
                    </div>
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Risk Level</dt>
                      <dd className="mt-1">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getRiskLevelClasses(
                            result.riskLevel,
                            isDark
                          )}`}
                        >
                          {result.riskLevel}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Findings</dt>
                      <dd className="mt-1">{issues.length}</dd>
                    </div>
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Security Score</dt>
                      <dd className="mt-1">{result.securityScore} / 100</dd>
                    </div>
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Security Grade</dt>
                      <dd className="mt-1">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getGradeClasses(
                            result.securityGrade,
                            isDark
                          )}`}
                        >
                          {result.securityGrade}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className={`font-semibold ${mutedTextClasses}`}>Scanned At</dt>
                      <dd className="mt-1">{new Date(result.scannedAt).toLocaleString()}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className={`text-sm ${mutedTextClasses}`}>Submit a target URL to generate a scan summary.</p>
                )}
              </ResultCard>
            </div>

            <div className="lg:col-span-6">
              <ResultCard title="Detected Vulnerabilities" subtitle="Classified by severity with OWASP mapping" isDark={isDark}>
                {issues.length ? (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {issues.map((issue, index) => {
                      const severityLabel = issue.severity || 'Medium';
                      const owasp = issue.owaspCategory || issue.owasp || 'A05 Security Misconfiguration';

                      return (
                        <li
                          key={`${issue.title}-${index}`}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p>{issue.title}</p>
                              <p className={`mt-1 text-xs ${mutedTextClasses}`}>
                                {issue.category || 'General'} | {owasp}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getSeverityClasses(
                                  severityLabel,
                                  isDark
                                )}`}
                              >
                                {severityLabel.toUpperCase()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleExplainIssue(issue.title)}
                                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                              >
                                Explain with AI
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={`text-sm ${mutedTextClasses}`}>No vulnerabilities detected yet.</p>
                )}
              </ResultCard>
            </div>

            <div className="lg:col-span-6">
              <SecurityHeadersCard securityHeaders={securityHeaders} isDark={isDark} />
            </div>

            <div className="lg:col-span-4">
              <ResultCard title="Open Ports" subtitle="Common service exposure" isDark={isDark}>
                <PortList ports={openPorts} isDark={isDark} />
              </ResultCard>
            </div>

            <div className="lg:col-span-4">
              <VulnerabilityChart issues={issues} severityCounts={severityCounts} isDark={isDark} />
            </div>

            <div className="lg:col-span-4">
              <RecommendationsCard recommendations={combinedRecommendations} isDark={isDark} />
            </div>

            <div className="lg:col-span-6">
              <AISummaryCard
                summaryPoints={aiSummaryPoints}
                recommendations={aiRecommendations}
                loading={aiLoading}
                error={aiError}
                hasScan={Boolean(result)}
                onGenerate={handleRefreshAIInsights}
                isDark={isDark}
              />
            </div>

            <div className="lg:col-span-6">
              <ScanHistory
                history={scanHistory}
                isDark={isDark}
                onSelect={handleSelectHistoryScan}
                onClear={handleClearHistory}
              />
            </div>

            <div className="lg:col-span-12">
              <SecurityChat isDark={isDark} />
            </div>
          </section>
        </div>
      </main>

      <AIExplanationModal
        isOpen={explanationModal.isOpen}
        issue={explanationModal.issue}
        loading={explanationModal.loading}
        data={explanationModal.data}
        error={explanationModal.error}
        onClose={handleCloseExplanationModal}
        isDark={isDark}
      />
    </div>
  );
}

export default HomePage;



