function SecurityScore({ score, riskLevel }) {
  const colorClass =
    riskLevel === 'Low'
      ? 'text-emerald-600'
      : riskLevel === 'Medium'
      ? 'text-amber-600'
      : 'text-rose-600';

  return (
    <div className="space-y-2">
      <p className={`text-5xl font-bold ${colorClass}`}>{score}</p>
      <p className="text-sm text-slate-600">Risk Level: <span className="font-semibold">{riskLevel}</span></p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slatebrand-500 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default SecurityScore;
