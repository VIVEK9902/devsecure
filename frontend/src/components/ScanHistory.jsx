import { motion } from 'framer-motion';
import ResultCard from './ResultCard';

const getRiskBadgeClasses = (riskLevel, isDark) => {
  if (riskLevel === 'Low') {
    return isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700';
  }

  if (riskLevel === 'Medium') {
    return isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
  }

  return isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700';
};

function ScanHistory({ history, isDark = true, onSelect, onClear }) {
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <ResultCard
      title="Recent Scans"
      subtitle="Click an entry to load full stored results"
      isDark={isDark}
      actions={
        history.length ? (
          <button
            type="button"
            onClick={onClear}
            className={`rounded-md px-2 py-1 text-xs ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Clear
          </button>
        ) : null
      }
    >
      {history.length ? (
        <ul className="space-y-2">
          {history.map((entry, index) => {
            const timestamp = entry.timestamp || entry.scannedAt;
            return (
              <motion.li
                key={`${entry.url}-${timestamp || index}`}
                whileHover={{ x: 4 }}
                className={`rounded-lg border p-3 text-sm ${
                  isDark ? 'border-slate-700 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="w-full text-left"
                  title="Load this scan result"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{entry.url}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${getRiskBadgeClasses(entry.riskLevel, isDark)}`}>
                      {entry.riskLevel}
                    </span>
                  </div>
                  <div className={`mt-1 flex flex-wrap gap-3 text-xs ${mutedText}`}>
                    <span>Score: {entry.securityScore}</span>
                    <span>{timestamp ? new Date(timestamp).toLocaleString() : 'No timestamp'}</span>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className={`text-sm ${mutedText}`}>No scans stored yet.</p>
      )}
    </ResultCard>
  );
}

export default ScanHistory;