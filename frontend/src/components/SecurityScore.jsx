import SecurityGauge from './SecurityGauge';

function SecurityScore({ score, riskLevel, isDark = true }) {
  return <SecurityGauge score={score} riskLevel={riskLevel} isDark={isDark} />;
}

export default SecurityScore;