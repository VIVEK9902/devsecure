import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import LoadingSpinner from './LoadingSpinner';

function ScanProgress({ stages, currentStage, isDark = true }) {
  const activeStage = stages[Math.min(currentStage, stages.length - 1)] || 'Scan complete';

  return (
    <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
      <TypeAnimation
        key={`${activeStage}-${currentStage}`}
        sequence={[`> ${activeStage}...`, 700]}
        speed={55}
        repeat={0}
        cursor={false}
        className="mb-3 block font-mono text-sm text-cyan-300"
      />

      <ul className="space-y-2">
        {stages.map((stage, index) => {
          const completed = index < currentStage;
          const active = index === currentStage;

          return (
            <motion.li
              key={stage}
              initial={{ opacity: 0.7, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`flex items-center gap-3 rounded-md px-2 py-1 text-sm ${
                active ? (isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-900') : ''
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  completed
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-cyan-400 text-slate-950'
                    : isDark
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {completed ? 'OK' : active ? <LoadingSpinner size="h-3.5 w-3.5" className="border-white/40 border-t-white" /> : index + 1}
              </span>
              <span>{stage}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export default ScanProgress;