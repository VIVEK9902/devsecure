const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const BULLET_PREFIX_REGEX = /^[-*\s]+/;

const stripMarkdownCodeFences = (text) => {
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return codeFenceMatch ? codeFenceMatch[1].trim() : text.trim();
};

const parseJsonFromResponse = (text) => {
  const cleaned = stripMarkdownCodeFences(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');

    if (objectStart !== -1 && objectEnd > objectStart) {
      try {
        return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
};

const normalizeSeverity = (severity) => {
  const normalized = String(severity || 'Medium').toLowerCase();
  if (normalized.includes('high')) return 'High';
  if (normalized.includes('low')) return 'Low';
  return 'Medium';
};

const inferOwaspFromText = (text) => {
  const normalized = String(text || '').toLowerCase();

  if (normalized.includes('xss') || normalized.includes('unsafe script') || normalized.includes('inline script')) {
    return 'A03 Injection';
  }

  if (normalized.includes('missing csp') || normalized.includes('content security policy')) {
    return 'A05 Security Misconfiguration';
  }

  if (normalized.includes('open port') || normalized.includes('header')) {
    return 'A05 Security Misconfiguration';
  }

  return 'A05 Security Misconfiguration';
};

const normalizeBulletPoints = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).replace(BULLET_PREFIX_REGEX, '').trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split('\n')
    .map((line) => line.replace(BULLET_PREFIX_REGEX, '').trim())
    .filter(Boolean);
};

async function queryAI(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    const err = new Error(
      error.message || 'Groq AI request failed.'
    );
    err.code = 'AI_REQUEST_FAILED';
    throw err;
  }
}

function formatIssues(issues) {
  return issues
    .map((issue) => {
      if (typeof issue === 'string') return `- ${issue}`;

      const title = issue.title || issue.name || 'Unknown issue';
      const severity = issue.severity || 'Medium';
      const owasp = issue.owaspCategory || issue.owasp || inferOwaspFromText(title);

      return `- ${title} (Severity: ${severity}, OWASP: ${owasp})`;
    })
    .join('\n');
}

async function generateAISecuritySummary({ url, issues, score }) {
  const formattedIssues = formatIssues(issues);

  const prompt = `
You are a cybersecurity expert.

Analyze the scan results and return bullet points only.
Return exactly 4 bullets in this order:
- Overall security score explanation
- Key vulnerabilities discovered
- Risk assessment
- Immediate actions recommended

Scan Data:
URL: ${url}
Security Score: ${score}
Issues:
${formattedIssues}
`;

  const responseText = await queryAI(prompt);

  const bulletPoints = normalizeBulletPoints(responseText)
    .filter((line) => !/^security summary$/i.test(line))
    .slice(0, 8);

  return bulletPoints.length
    ? bulletPoints
    : ['Unable to generate AI summary points. Review scan findings manually.'];
}

async function explainIssueWithAI(vulnerability) {
  const prompt = `
You are a professional cybersecurity analyst.

For the vulnerability below return the answer in JSON format.

Provide:
1. explanation
2. impact
3. suggested_fix
4. severity
5. owasp_category

Return only JSON.

Example format:
{
 "explanation": "...",
 "impact": "...",
 "suggested_fix": "...",
 "severity": "High",
 "owasp_category": "A03 Injection"
}

Vulnerability:
${vulnerability}
`;

  const responseText = await queryAI(prompt);
  const parsed = parseJsonFromResponse(responseText);

  if (!parsed) {
    return {
      explanation: responseText || 'Explanation unavailable from AI.',
      impact: 'Potential security exposure if left unaddressed.',
      suggestedFix: 'Apply secure coding and configuration controls relevant to this issue.',
      severity: 'Medium',
      owasp: inferOwaspFromText(vulnerability),
    };
  }

  return {
    explanation: parsed.explanation || 'Explanation unavailable.',
    impact: parsed.impact || 'Impact details unavailable.',
    suggestedFix: parsed.suggested_fix || parsed.suggestedFix || 'Suggested fix unavailable.',
    severity: normalizeSeverity(parsed.severity),
    owasp: parsed.owasp_category || parsed.owasp || inferOwaspFromText(vulnerability),
  };
}

async function generateAIRecommendations(issues) {
  const formattedIssues = formatIssues(issues);

  const prompt = `
You are a cybersecurity expert.

Provide remediation recommendations in bullet points only.
Use "-" at the start of each line.
Return 5 to 8 concise and actionable bullets.

Issues:
${formattedIssues}
`;

  const responseText = await queryAI(prompt);

  const recommendations = normalizeBulletPoints(responseText).slice(0, 10);

  return recommendations.length
    ? recommendations
    : ['No AI recommendation generated. Review findings and apply standard hardening guidance.'];
}

async function securityChatReply(message) {
  const prompt = `
You are a cybersecurity assistant.

Always answer using clear bullet points only.
Use this structure:
- Explanation
- Risk
- Example
- Recommended Fix

User Question:
${message}
`;

  const responseText = await queryAI(prompt);

  const bulletPoints = normalizeBulletPoints(responseText).slice(0, 8);

  return bulletPoints.length
    ? bulletPoints
    : ['No structured response generated.', 'Retry your question with more context.'];
}

module.exports = {
  explainIssueWithAI,
  generateAISecuritySummary,
  generateAIRecommendations,
  securityChatReply,
};