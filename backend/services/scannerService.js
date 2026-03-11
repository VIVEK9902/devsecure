const axios = require('axios');
const portscanner = require('portscanner');
const { normalizeUrl, getHostname } = require('../utils/urlUtils');
const { calculateRisk } = require('../utils/riskUtils');
const { setLatestScan } = require('./scanStore');
const { crawlSite } = require("./crawlerService");
const { fetchCVE } = require("./cveService");
const { simulateXSS, simulateClickjacking } = require("./attackSimulationService");

const REQUIRED_HEADERS = [
  { key: 'content-security-policy', name: 'Content-Security-Policy' },
  { key: 'x-frame-options', name: 'X-Frame-Options' },
  { key: 'x-content-type-options', name: 'X-Content-Type-Options' },
  { key: 'strict-transport-security', name: 'Strict-Transport-Security' },
  { key: 'referrer-policy', name: 'Referrer-Policy' },
];

const COMMON_PORTS = [21, 22, 80, 443, 3000, 8080];

const HEADER_SEVERITY = {
  'Content-Security-Policy': 'High',
  'X-Frame-Options': 'Medium',
  'X-Content-Type-Options': 'Medium',
  'Strict-Transport-Security': 'High',
  'Referrer-Policy': 'Low',
};

const OWASP_MAPPINGS = [
  { pattern: /xss|unsafe script|inline script/i, category: 'A03 Injection' },
  { pattern: /open port/i, category: 'A05 Security Misconfiguration' },
  {
    pattern:
      /content-security-policy|x-frame-options|x-content-type-options|strict-transport-security|referrer-policy|header/i,
    category: 'A05 Security Misconfiguration',
  },
];

const checkPortStatus = (port, hostname) =>
  new Promise((resolve) => {
    portscanner.checkPortStatus(port, hostname, (error, status) => {
      if (error) {
        return resolve('closed');
      }
      return resolve(status);
    });
  });

const getPortSeverity = (port) => {
  if ([21, 22, 3000, 8080].includes(port)) {
    return 'High';
  }

  if (port === 80) {
    return 'Medium';
  }

  return 'Low';
};

const getSeverityScore = (severity) => {
  if (severity === 'High') return 8.5;
  if (severity === 'Medium') return 6.0;
  return 3.5;
};

const getSecurityGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const getOwaspCategory = (title) => {
  const match = OWASP_MAPPINGS.find((mapping) => mapping.pattern.test(title));
  return match ? match.category : 'A05 Security Misconfiguration';
};

const enrichIssue = (issue) => {
  const owaspCategory = getOwaspCategory(issue.title);

  return {
    ...issue,
    owaspCategory,
    owasp: owaspCategory,
    severityScore: getSeverityScore(issue.severity || 'Medium'),
  };
};

const getSecurityHeadersStatus = (headers) => {
  return REQUIRED_HEADERS.map((header) => ({
    name: header.name,
    status: headers[header.key] ? 'present' : 'missing',
  }));
};

const getHeaderIssues = (securityHeaders) => {
  return securityHeaders
    .filter((header) => header.status === 'missing')
    .map((header) =>
      enrichIssue({
        title: `Missing ${header.name}`,
        severity: HEADER_SEVERITY[header.name] || 'Medium',
        category: 'Header',
        explanation: `${header.name} is missing, reducing browser-enforced security controls.`,
        impact: 'Increases exposure to client-side attacks and misconfiguration abuse.',
        suggestedFix: `Configure ${header.name} with a secure policy value on your web server.`,
      })
    );
};

const getXssIssues = (html) => {
  const issues = [];

  const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i;
  if (inlineScriptRegex.test(html)) {
    issues.push(
      enrichIssue({
        title: 'Potential XSS risk due to inline script tags',
        severity: 'High',
        category: 'XSS',
        explanation:
          'Inline scripts were detected, which weakens CSP effectiveness and increases injection risk.',
        impact: 'Attackers may inject malicious scripts and execute them in user browsers.',
        suggestedFix: 'Move inline scripts to trusted external files and enforce CSP nonces/hashes.',
      })
    );
  }

  const unsafeScriptRegex = /\beval\s*\(|document\.write\s*\(|\.innerHTML\s*=|on\w+\s*=/i;
  if (unsafeScriptRegex.test(html)) {
    issues.push(
      enrichIssue({
        title: 'Potential XSS risk due to unsafe script usage',
        severity: 'Medium',
        category: 'XSS',
        explanation: 'Potentially unsafe JavaScript patterns were detected.',
        impact: 'Can enable script injection and arbitrary code execution in the browser context.',
        suggestedFix: 'Avoid eval/document.write/unsafe innerHTML and sanitize untrusted input.',
      })
    );
  }

  return issues;
};

const scanPorts = async (hostname) => {
  const checks = COMMON_PORTS.map(async (port) => {
    const status = await checkPortStatus(port, hostname);
    return status === 'open' ? port : null;
  });

  const portResults = await Promise.all(checks);
  return portResults.filter((port) => port !== null);
};

const getPortIssues = (openPorts) => {
  return openPorts.map((port) =>
    enrichIssue({
      title: `Open port detected: ${port}`,
      severity: getPortSeverity(port),
      category: 'Port',
      explanation: `Port ${port} is reachable from the network surface scanned by DevSecure.`,
      impact: 'Open ports can expose unnecessary services and increase attack surface.',
      suggestedFix: 'Close unused ports and limit exposure with firewall/network ACL controls.',
    })
  );
};

const getRecommendations = ({ securityHeaders, xssIssues, openPorts }) => {
  const recommendations = new Set();

  securityHeaders
    .filter((header) => header.status === 'missing')
    .forEach((header) => {
      if (header.name === 'Content-Security-Policy') {
        recommendations.add(
          'Add a strict Content-Security-Policy header to reduce XSS and injection exposure.'
        );
      } else if (header.name === 'Strict-Transport-Security') {
        recommendations.add(
          'Enable Strict-Transport-Security (HSTS) to enforce HTTPS for all future requests.'
        );
      } else if (header.name === 'X-Frame-Options') {
        recommendations.add(
          'Set X-Frame-Options to DENY or SAMEORIGIN to mitigate clickjacking attacks.'
        );
      } else if (header.name === 'X-Content-Type-Options') {
        recommendations.add(
          'Set X-Content-Type-Options to nosniff to prevent MIME-type sniffing vulnerabilities.'
        );
      } else if (header.name === 'Referrer-Policy') {
        recommendations.add(
          'Configure Referrer-Policy to limit information leakage through referrer headers.'
        );
      }
    });

  if (xssIssues.some((issue) => issue.title.includes('inline script tags'))) {
    recommendations.add(
      'Avoid inline JavaScript and move scripts to trusted external files with nonce/hash policies.'
    );
  }

  if (xssIssues.some((issue) => issue.title.includes('unsafe script usage'))) {
    recommendations.add(
      'Eliminate eval/document.write/unsafe innerHTML patterns and sanitize all untrusted input.'
    );
  }

  if (openPorts.length > 0) {
    recommendations.add(
      'Close unused ports and restrict network exposure with firewall rules and allowlists.'
    );
  }

  if (openPorts.some((port) => [21, 22].includes(port))) {
    recommendations.add(
      'Harden remote access ports (21/22): use key-based auth, IP restrictions, and disable unused services.'
    );
  }

  if (recommendations.size === 0) {
    recommendations.add(
      'No major issues detected in this basic scan; continue regular monitoring and patch management.'
    );
  }

  return Array.from(recommendations);
};

const getSeverityCounts = (issues) => {
  return issues.reduce(
    (accumulator, issue) => {
      const key = (issue.severity || 'Medium').toLowerCase();
      if (key in accumulator) {
        accumulator[key] += 1;
      }
      return accumulator;
    },
    { high: 0, medium: 0, low: 0 }
  );
};

const sortIssuesBySeverity = (issues) => {
  const order = { High: 0, Medium: 1, Low: 2 };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
};

const scanTarget = async (rawUrl) => {
  const targetUrl = normalizeUrl(rawUrl);
  const hostname = getHostname(targetUrl);

  // Crawl additional pages
  let crawledPages = [];
  try {
    crawledPages = await crawlSite(targetUrl);
  } catch (err) {
    console.log("Crawler failed:", err.message);
  }

  const scanTargets = [targetUrl, ...crawledPages];

  let headers = {};
  let html = "";

  for (const url of scanTargets) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      headers = response.headers || {};
      html += typeof response.data === 'string' ? response.data : '';
    } catch (error) {
      console.log("Failed scanning page:", url);
    }
  }

  const securityHeaders = getSecurityHeadersStatus(headers);
  const headerIssues = getHeaderIssues(securityHeaders);
  
  const xssIssues = getXssIssues(html);
  const simulatedXssIssues = simulateXSS(html);
  const clickjackingIssues = simulateClickjacking(headers);
  
  const openPorts = await scanPorts(hostname);
  const portIssues = getPortIssues(openPorts);

  let issues = sortIssuesBySeverity([...headerIssues, ...xssIssues, ...simulatedXssIssues, ...clickjackingIssues, ...portIssues]);

  // Attach CVE intelligence
  for (const issue of issues) {
    const keyword = issue.category || issue.title;
    const cve = await fetchCVE(keyword);

    if (cve) {
      issue.cve = cve.id;
      issue.cvss = cve.cvss;
      issue.description = cve.summary;
    }
  }

  const { securityScore, riskLevel } = calculateRisk({
    missingHeaders: headerIssues.length,
    openPorts: openPorts.length,
    xssFindings: xssIssues.length,
  });

  const securityGrade = getSecurityGrade(securityScore);

  const recommendations = getRecommendations({
    securityHeaders,
    xssIssues,
    openPorts,
  });

  const result = {
    url: targetUrl,
    securityScore,
    securityGrade,
    riskLevel,
    issues,
    openPorts,
    securityHeaders,
    recommendations,
    severityCounts: getSeverityCounts(issues),
    aiSummaryPoints: [],
    aiRecommendations: [],
    scannedAt: new Date().toISOString(),
  };

  setLatestScan(result);
  return result;
};

module.exports = {
  scanTarget,
};