// Tampilan seragam untuk loading / error / kosong
export default function StateView({ loading, error, empty, emptyText, onRetry, children }) {
  if (loading) return <p className="state">Memuat…</p>;
  if (error)
    return (
      <div className="state state--error">
        <p>{error}</p>
        {onRetry && (
          <button className="btn btn--ghost" onClick={onRetry}>
            Coba lagi
          </button>
        )}
      </div>
    );
  if (empty) return <p className="state">{emptyText}</p>;
  return children;
}
