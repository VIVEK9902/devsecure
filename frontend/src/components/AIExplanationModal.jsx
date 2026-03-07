import { AnimatePresence, motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const getSeverityBadgeClasses = (severity, isDark) => {
  const normalized = String(severity || '').toLowerCase();

  if (normalized === 'high') {
    return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
  }

  if (normalized === 'medium') {
    return isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
  }

  return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
};

function AIExplanationModal({ isOpen, issue, loading, data, error, onClose, isDark = true }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-w-2xl rounded-xl border p-5 shadow-xl backdrop-blur ${
              isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-900'
            }`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">AI Vulnerability Explanation</p>
                <h3 className="mt-2 text-lg font-semibold">{issue}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-md px-2 py-1 text-sm ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Close
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <LoadingSpinner />
                Fetching explanation from AI...
              </div>
            ) : null}

            {error ? (
              <p className={`rounded-lg border px-3 py-2 text-sm ${isDark ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                {error}
              </p>
            ) : null}

            {data ? (
              <div className="space-y-3 text-sm">
                <section className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h4 className="font-semibold text-cyan-300">Explanation</h4>
                  <p className="mt-1 leading-relaxed">{data.explanation}</p>
                </section>
                <section className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h4 className="font-semibold text-cyan-300">Impact</h4>
                  <p className="mt-1 leading-relaxed">{data.impact}</p>
                </section>
                <section className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h4 className="font-semibold text-cyan-300">Suggested Fix</h4>
                  <p className="mt-1 leading-relaxed">{data.suggestedFix || data.fix}</p>
                </section>
                <section className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getSeverityBadgeClasses(data.severity, isDark)}`}>
                    Severity: {(data.severity || 'Medium').toUpperCase()}
                  </span>
                  <span className={`rounded-full border px-2 py-1 text-xs ${isDark ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-cyan-200 bg-cyan-50 text-cyan-700'}`}>
                    OWASP: {data.owasp || 'A05 Security Misconfiguration'}
                  </span>
                </section>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AIExplanationModal;