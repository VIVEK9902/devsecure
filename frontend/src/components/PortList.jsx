const getPortRiskStyles = (port, isDark) => {
  if ([21, 22, 3000, 8080].includes(port)) {
    return isDark
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-300'
      : 'border-rose-200 bg-rose-50 text-rose-700';
  }

  if (port === 80) {
    return isDark
      ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return isDark
    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';
};

function PortList({ ports, isDark = true }) {
  const emptyText = isDark ? 'text-slate-400' : 'text-slate-600';

  if (!ports.length) {
    return <p className={`text-sm ${emptyText}`}>No common open ports detected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ports.map((port) => (
        <span
          key={port}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPortRiskStyles(port, isDark)}`}
        >
          Port {port}
        </span>
      ))}
    </div>
  );
}

export default PortList;