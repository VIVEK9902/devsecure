function LoadingSpinner({ size = 'h-5 w-5', className = '' }) {
  return (
    <span
      className={`${size} inline-block animate-spin rounded-full border-2 border-cyan-200/25 border-t-cyan-400 ${className}`}
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;