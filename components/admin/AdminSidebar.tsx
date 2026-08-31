"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./AdminSidebar.module.css";
import { LayoutDashboard, Armchair, Folders, ClipboardList, Users, MessageSquare } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/products", label: "Products", icon: <Armchair size={20} /> },
  { href: "/admin/categories", label: "Categories", icon: <Folders size={20} /> },
  { href: "/admin/enquiries", label: "Enquiries", icon: <ClipboardList size={20} /> },
  { href: "/admin/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { href: "/admin/customers", label: "Customers", icon: <Users size={20} /> },
];

export default function AdminSidebar({ 
  userEmail,
  unreadMessages = 0,
  newEnquiries = 0
}: { 
  userEmail: string,
  unreadMessages?: number,
  newEnquiries?: number
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/products", label: "Products", icon: <Armchair size={20} /> },
    { href: "/admin/categories", label: "Categories", icon: <Folders size={20} /> },
    { href: "/admin/enquiries", label: "Enquiries", icon: <ClipboardList size={20} />, badge: newEnquiries },
    { href: "/admin/messages", label: "Messages", icon: <MessageSquare size={20} />, badge: unreadMessages },
    { href: "/admin/customers", label: "Customers", icon: <Users size={20} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>Unique Timber</h2>
        <p>Admin Panel</p>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? styles.active : ""}`}
          >
            <div className={styles.navItemContent}>
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && item.badge > 0 ? (
              <span className={styles.badge}>{item.badge}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link href="/" target="_blank" className={styles.viewSite}>
          View Live Site ↗
        </Link>
        <div className={styles.user}>
          <span title={userEmail}>Admin</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className={styles.logout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
