export default function Loading() {
  return (
    <div className="container" style={{ padding: '6rem 1rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Loading Product Details...</p>
    </div>
  );
}
