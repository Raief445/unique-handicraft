import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./admin.module.css";
import prisma from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const unreadMessagesCount = await prisma.contactMessage.count({ where: { status: "UNREAD" } });
  const newEnquiriesCount = await prisma.enquiry.count({ where: { status: "NEW" } });

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar 
        userEmail={session.user?.email || ""} 
        unreadMessages={unreadMessagesCount}
        newEnquiries={newEnquiriesCount}
      />
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
