function ScanForm({ url, onUrlChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
      <input
        type="text"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://example.com"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slatebrand-500 focus:ring-2 focus:ring-slatebrand-200"
        aria-label="Website URL"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slatebrand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slatebrand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Scanning...' : 'Scan Website'}
      </button>
    </form>
  );
}

export default ScanForm;
