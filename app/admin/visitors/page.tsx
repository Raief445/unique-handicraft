import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import styles from "./page.module.css";
import { Users, Clock, Globe } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function VisitorsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const visitors = await prisma.visitorLog.findMany({
    orderBy: { visitedAt: 'desc' },
    take: 100, // Show last 100 visits
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visitsToday = await prisma.visitorLog.count({
    where: {
      visitedAt: {
        gte: today,
      },
    },
  });

  const totalVisits = await prisma.visitorLog.count();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Website Visitors</h1>
          <p>Track recent visits to your website</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Visits Today</h3>
            <p>{visitsToday}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Globe size={24} /></div>
          <div className={styles.statInfo}>
            <h3>Total Visits</h3>
            <p>{totalVisits}</p>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Page</th>
              <th>IP Address</th>
              <th>Device / Browser</th>
            </tr>
          </thead>
          <tbody>
            {visitors.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>No visitors logged yet.</td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td>
                    <div className={styles.timeCell}>
                      <Clock size={14} className={styles.clockIcon} />
                      {format(new Date(visitor.visitedAt), "MMM d, yyyy HH:mm")}
                    </div>
                  </td>
                  <td>
                    <span className={styles.pathBadge}>{visitor.path || '/'}</span>
                  </td>
                  <td>{visitor.ipAddress}</td>
                  <td className={styles.userAgentCell}>{visitor.userAgent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
