import { motion } from 'framer-motion';

function ResultCard({ title, subtitle, children, actions, isDark = true }) {
  const cardClasses = isDark
    ? 'border-slate-700 bg-slate-900/80 text-slate-200'
    : 'border-slate-200 bg-white text-slate-900';

  const subtitleClasses = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border p-5 shadow-lg backdrop-blur ${cardClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">{title}</h3>
          {subtitle ? <p className={`mt-2 text-sm ${subtitleClasses}`}>{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </motion.article>
  );
}

export default ResultCard;