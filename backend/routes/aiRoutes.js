const express = require("express");
const router = express.Router();

const {
  explainVulnerability,
  generateSecuritySummary,
  generateSecurityRecommendations,
  securityAssistantChat
} = require("../controllers/aiController");

router.post("/explain", explainVulnerability);
router.post("/summary", generateSecuritySummary);
router.post("/recommend", generateSecurityRecommendations);
router.post("/chat", securityAssistantChat);

module.exports = router;