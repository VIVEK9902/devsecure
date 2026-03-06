function PortList({ ports }) {
  if (!ports.length) {
    return <p className="text-sm text-slate-600">No common open ports detected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ports.map((port) => (
        <span
          key={port}
          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
        >
          Port {port}
        </span>
      ))}
    </div>
  );
}

export default PortList;
