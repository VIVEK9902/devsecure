function ResultCard({ title, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-slatebrand-700">{title}</h3>
      <div className="mt-4">{children}</div>
    </article>
  );
}

export default ResultCard;
