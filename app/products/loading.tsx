export default function Loading() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '2rem' }}>Loading Products...</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              height: '350px', 
              backgroundColor: 'var(--color-border)', 
              borderRadius: 'var(--border-radius-md)', 
              animation: 'pulse 1.5s infinite ease-in-out' 
            }} 
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
