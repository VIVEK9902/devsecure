import ResultCard from './ResultCard';

function SecurityHeadersCard({ securityHeaders, isDark = true }) {
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <ResultCard title="Security Headers" subtitle="Presence check for key hardening headers" isDark={isDark}>
      {securityHeaders.length ? (
        <ul className="space-y-2">
          {securityHeaders.map((header) => {
            const present = header.status === 'present';
            return (
              <li
                key={header.name}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span>{header.name}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${present ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    aria-hidden="true"
                  />
                  <span className={present ? 'text-emerald-400' : 'text-rose-400'}>
                    {present ? 'Present' : 'Missing'}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={`text-sm ${mutedText}`}>Run a scan to view security header status.</p>
      )}
    </ResultCard>
  );
}

export default SecurityHeadersCard;