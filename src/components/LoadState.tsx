export function LoadState({loading, error, retry}: {loading: boolean; error: string; retry: () => void}) {
  if (loading) return <p role="status" className="empty">Carregando…</p>;
  if (error) return <div className="notice" role="alert"><p className="error">{error}</p><button className="primary" onClick={retry}>Tentar novamente</button></div>;
  return null;
}
