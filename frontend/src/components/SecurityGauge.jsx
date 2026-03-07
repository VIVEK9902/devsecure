import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const getGaugeColor = (score) => {
  if (score >= 80) {
    return '#22c55e';
  }

  if (score >= 50) {
    return '#f59e0b';
  }

  return '#ef4444';
};

const getGradeBadgeClasses = (grade, isDark) => {
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

  return isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700';
};

function SecurityGauge({ score, riskLevel, securityGrade, isDark = true }) {
  const gaugeColor = getGaugeColor(score);
  const textClasses = isDark ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className="mx-auto w-full max-w-[220px] space-y-3">
      <CircularProgressbar
        value={score}
        text={`${score} / 100`}
        styles={buildStyles({
          textSize: '12px',
          pathColor: gaugeColor,
          textColor: isDark ? '#e2e8f0' : '#0f172a',
          trailColor: isDark ? '#334155' : '#e2e8f0',
        })}
      />

      <div className="space-y-2 text-center">
        <p className={`text-sm ${textClasses}`}>
          Risk Level: <span className="font-semibold">{riskLevel || 'Unknown'}</span>
        </p>
        <p className={`text-sm ${textClasses}`}>
          Grade:{' '}
          <span className={`rounded-full px-2 py-0.5 font-semibold ${getGradeBadgeClasses(securityGrade || 'F', isDark)}`}>
            {securityGrade || 'F'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default SecurityGauge;