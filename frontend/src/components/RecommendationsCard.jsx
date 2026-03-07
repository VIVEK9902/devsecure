import ResultCard from './ResultCard';

function RecommendationsCard({ recommendations, isDark = true }) {
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <ResultCard title="Recommendations" subtitle="Actionable hardening guidance" isDark={isDark}>
      {recommendations.length ? (
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li
              key={`${recommendation}-${index}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                isDark ? 'border-slate-700 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {recommendation}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-sm ${mutedText}`}>Run a scan to generate recommendations.</p>
      )}
    </ResultCard>
  );
}

export default RecommendationsCard;