const axios = require('axios');
const portscanner = require('portscanner');
const { normalizeUrl, getHostname } = require('../utils/urlUtils');
const { calculateRisk } = require('../utils/riskUtils');
const { setLatestScan } = require('./scanStore');

const checkPortStatus = (port, hostname) =>
  new Promise((resolve) => {
    portscanner.checkPortStatus(port, hostname, (error, status) => {
      if (error) {
        return resolve('closed');
      }

      return resolve(status);
    });
  });

const REQUIRED_HEADERS = [
  { key: 'content-security-policy', label: 'Content-Security-Policy' },
  { key: 'x-frame-options', label: 'X-Frame-Options' },
  { key: 'x-content-type-options', label: 'X-Content-Type-Options' },
  { key: 'strict-transport-security', label: 'Strict-Transport-Security' },
  { key: 'referrer-policy', label: 'Referrer-Policy' },
];

const COMMON_PORTS = [21, 22, 80, 443, 3000, 8080];

const getHeaderIssues = (headers) => {
  return REQUIRED_HEADERS.filter((header) => !headers[header.key]).map(
    (header) => `Missing ${header.label} header`
  );
};

const getXssIssues = (html) => {
  const issues = [];

  // Detect inline script blocks without src attributes.
  const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i;
  if (inlineScriptRegex.test(html)) {
    issues.push('Potential XSS risk due to inline script tags');
  }

  // Detect frequently abused script patterns that can enable unsafe execution.
  const unsafeScriptRegex = /\beval\s*\(|document\.write\s*\(|\.innerHTML\s*=|on\w+\s*=/i;
  if (unsafeScriptRegex.test(html)) {
    issues.push('Potential XSS risk due to unsafe script usage');
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

const scanTarget = async (rawUrl) => {
  const targetUrl = normalizeUrl(rawUrl);
  const hostname = getHostname(targetUrl);

  let response;
  try {
    response = await axios.get(targetUrl, {
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
  } catch (error) {
    const unreachableError = new Error('Unable to reach the target URL. Check the URL and try again.');
    unreachableError.code = 'TARGET_UNREACHABLE';
    throw unreachableError;
  }

  const headers = response.headers || {};
  const html = typeof response.data === 'string' ? response.data : '';

  const headerIssues = getHeaderIssues(headers);
  const xssIssues = getXssIssues(html);
  const openPorts = await scanPorts(hostname);

  const { securityScore, riskLevel } = calculateRisk({
    missingHeaders: headerIssues.length,
    openPorts: openPorts.length,
    xssFindings: xssIssues.length,
  });

  const result = {
    url: targetUrl,
    securityScore,
    riskLevel,
    issues: [...headerIssues, ...xssIssues],
    openPorts,
    scannedAt: new Date().toISOString(),
  };

  setLatestScan(result);
  return result;
};

module.exports = {
  scanTarget,
};
