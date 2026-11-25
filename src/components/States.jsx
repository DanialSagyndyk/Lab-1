export function Loading({ children = "Loading…" }) { return <p className="loading">{children}</p>; }
export function ErrorBox({ message, onRetry }) {
  return (
    <p className="error" role="alert">
      Unable to load data: {message}{" "}
      {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
    </p>
  );
}
export function Empty() { return <p className="empty">No matching products. Try changing your search or filters.</p>; }
