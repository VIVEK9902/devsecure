function ScanForm({ url, onUrlChange, onSubmit, loading, isDark = true }) {
  const inputClasses = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/25'
    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 focus:ring-cyan-600/20';

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 md:flex-row">
      <input
        type="text"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://example.com"
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ring-4 ring-transparent transition ${inputClasses}`}
        aria-label="Target URL"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Scanning...' : 'Scan Target'}
      </button>
    </form>
  );
}

export default ScanForm;