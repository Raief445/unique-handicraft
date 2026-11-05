import prisma from "@/lib/db";
import MessageDeleteButton from "@/components/admin/MessageDeleteButton";
import styles from "../dashboard.module.css";
import { Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Inquiries &amp; Messages</h1>
        <p>Customer messages submitted through the website contact form</p>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Sender</th>
                <th>Company</th>
                <th>Subject &amp; Message</th>
                <th>Contact Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "3rem", color: "#888" }}
                  >
                    No messages received yet.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} style={{ verticalAlign: "top" }}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: "#2c2520" }}>{msg.name}</strong>
                    </td>
                    <td>
                      <span style={{ color: "#64748b" }}>{msg.company || "—"}</span>
                    </td>
                    <td style={{ maxWidth: 380 }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        {msg.subject}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "#475569",
                          lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.message}
                      </p>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          fontSize: "0.85rem",
                        }}
                      >
                        <a
                          href={`mailto:${msg.email}`}
                          style={{
                            color: "#8c6734",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Mail size={13} />
                          <span>{msg.email}</span>
                        </a>
                        {msg.phone && (
                          <a
                            href={`tel:${msg.phone}`}
                            style={{
                              color: "#64748b",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Phone size={13} />
                            <span>{msg.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <MessageDeleteButton messageId={msg.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
