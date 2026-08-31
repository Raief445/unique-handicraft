export default function Loading() {
  return (
    <div className="container" style={{ padding: '8rem 1rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Loading...</p>
    </div>
  );
}
