const {
  explainIssueWithAI,
  generateAISecuritySummary,
  generateAIRecommendations,
  securityChatReply,
} = require('../services/aiService');
const { updateLatestScan } = require('../services/scanStore');

const handleAIError = (error, res, next) => {
  if (error.code === 'AI_REQUEST_FAILED') {
    return res.status(502).json({ message: error.message });
  }

  return next(error);
};

exports.explainVulnerability = async (req, res, next) => {
  try {
    const { vulnerability } = req.body;

    if (!vulnerability || typeof vulnerability !== 'string') {
      return res.status(400).json({ message: 'vulnerability is required and must be a string.' });
    }

    const explanation = await explainIssueWithAI(vulnerability);
    return res.json(explanation);
  } catch (error) {
    return handleAIError(error, res, next);
  }
};

exports.generateSecuritySummary = async (req, res, next) => {
  try {
    const { url, issues, score } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'url is required and must be a string.' });
    }

    if (!Array.isArray(issues)) {
      return res.status(400).json({ message: 'issues must be an array.' });
    }

    if (typeof score !== 'number') {
      return res.status(400).json({ message: 'score must be a number.' });
    }

    const summary = await generateAISecuritySummary({ url, issues, score });
    updateLatestScan({ aiSummaryPoints: summary });

    return res.json({ summary });
  } catch (error) {
    return handleAIError(error, res, next);
  }
};

exports.generateSecurityRecommendations = async (req, res, next) => {
  try {
    const { issues } = req.body;

    if (!Array.isArray(issues)) {
      return res.status(400).json({ message: 'issues must be an array.' });
    }

    const recommendations = await generateAIRecommendations(issues);
    updateLatestScan({ aiRecommendations: recommendations });

    return res.json({ recommendations });
  } catch (error) {
    return handleAIError(error, res, next);
  }
};

exports.securityAssistantChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'message is required and must be a string.' });
    }

    const response = await securityChatReply(message);
    return res.json({ response });
  } catch (error) {
    return handleAIError(error, res, next);
  }
};