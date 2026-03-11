function simulateXSS(html) {
  const issues = [];

  const payload = "<script>alert('XSS')</script>";

  if (html.includes("<script>")) {
    issues.push({
      title: "XSS Attack Simulation Detected",
      severity: "High",
      category: "Attack Simulation",
      explanation:
        "Inline script usage may allow attackers to inject malicious JavaScript payloads.",
      impact:
        "Attackers could execute arbitrary JavaScript in the user's browser, leading to session hijacking or data theft.",
      suggestedFix:
        "Avoid inline scripts and enforce a strict Content-Security-Policy (CSP).",
      payloadTested: payload,
    });
  }

  return issues;
}

function simulateClickjacking(headers) {
  const issues = [];

  if (!headers["x-frame-options"]) {
    issues.push({
      title: "Clickjacking Attack Simulation",
      severity: "Medium",
      category: "Attack Simulation",
      explanation:
        "Missing X-Frame-Options header allows attackers to embed your site inside malicious iframes.",
      impact:
        "Users could unknowingly click hidden elements leading to unauthorized actions.",
      suggestedFix:
        "Add X-Frame-Options header with value DENY or SAMEORIGIN.",
    });
  }

  return issues;
}

module.exports = {
  simulateXSS,
  simulateClickjacking,
};