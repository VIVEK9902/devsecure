const calculateRisk = ({ missingHeaders = 0, openPorts = 0, xssFindings = 0 }) => {
  const headerPenalty = missingHeaders * 10;
  const portPenalty = openPorts * 5;
  const xssPenalty = xssFindings * 15;

  const rawScore = 100 - headerPenalty - portPenalty - xssPenalty;
  const securityScore = Math.max(0, Math.min(100, rawScore));

  let riskLevel = 'High';
  if (securityScore >= 80) {
    riskLevel = 'Low';
  } else if (securityScore >= 50) {
    riskLevel = 'Medium';
  }

  return { securityScore, riskLevel };
};

module.exports = {
  calculateRisk,
};
