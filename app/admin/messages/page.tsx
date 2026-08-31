import prisma from "@/lib/db";


export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Messages & Inquiries</h1>
      </div>

      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {messages.length === 0 ? (
          <p>No messages received yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>Date</th>
                <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>Name</th>
                <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>Company</th>
                <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>Subject</th>
                <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>Contact Info</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: "1px solid var(--border-color)", verticalAlign: "top" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontSize: "0.9rem" }}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>{msg.name}</td>
                  <td style={{ padding: "1rem" }}>{msg.company}</td>
                  <td style={{ padding: "1rem" }}>
                    <strong>{msg.subject}</strong>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </p>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontSize: "0.9rem" }}><a href={`mailto:${msg.email}`}>{msg.email}</a></div>
                    {msg.phone && <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>{msg.phone}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
