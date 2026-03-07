import { AnimatePresence, motion } from 'framer-motion';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';

function AISummaryCard({ summaryPoints, recommendations, loading, error, hasScan, onGenerate, isDark = true }) {
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <ResultCard
      title="AI Security Summary"
      subtitle="LLM-generated assessment and remediation priorities"
      isDark={isDark}
      actions={
        <button
          type="button"
          onClick={onGenerate}
          disabled={!hasScan || loading}
          className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Refresh AI Insights'}
        </button>
      }
    >
      {!hasScan ? (
        <p className={`text-sm ${mutedText}`}>Run a scan to generate AI insights.</p>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <LoadingSpinner />
              AI is analyzing scan findings...
            </div>
          ) : null}

          {error ? (
            <p className={`rounded-lg border px-3 py-2 text-sm ${isDark ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {error}
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={summaryPoints.join('|') || 'empty-summary'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {summaryPoints.length ? (
                <div className="rounded-lg border border-cyan-500 bg-black p-3 font-mono text-green-400">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">Security Summary</p>
                  <ul className="list-disc space-y-2 pl-6 text-sm">
                    {summaryPoints.map((point, index) => (
                      <li key={`${point}-${index}`}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={`text-sm ${mutedText}`}>No AI summary yet. Use "Refresh AI Insights".</p>
              )}
            </motion.div>
          </AnimatePresence>

          {recommendations.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">AI Recommendations</p>
              <ul className="list-disc space-y-2 pl-6 text-sm">
                {recommendations.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </ResultCard>
  );
}

export default AISummaryCard;