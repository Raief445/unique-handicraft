import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./admin.module.css";
import prisma from "@/lib/db";
import { ExternalLink } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const unreadMessagesCount = await prisma.contactMessage.count({ where: { status: "UNREAD" } });
  const newEnquiriesCount = await prisma.enquiry.count({ where: { status: "NEW" } });

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar
        userEmail={session.user?.email || ""}
        unreadMessages={unreadMessagesCount}
        newEnquiries={newEnquiriesCount}
      />
      <main className={styles.adminMain}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.portalTitle}>Store Management</span>
            <span className={styles.topBarDivider}>/</span>
            <a
              href="https://uniquehandicrafts.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.siteLink}
            >
              <span>uniquehandicrafts.in</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.statusIndicator}>
              <span className={styles.pulseDot}></span>
              <span>Live System Online</span>
            </div>
            <span className={styles.currentDate}>{currentDateStr}</span>
          </div>
        </header>

        <div className={styles.contentArea}>{children}</div>
      </main>
    </div>
  );
}
