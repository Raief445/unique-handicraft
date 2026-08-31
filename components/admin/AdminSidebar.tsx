"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./AdminSidebar.module.css";
import { LayoutDashboard, Armchair, Folders, ClipboardList, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/products", label: "Products", icon: <Armchair size={20} /> },
  { href: "/admin/categories", label: "Categories", icon: <Folders size={20} /> },
  { href: "/admin/enquiries", label: "Enquiries", icon: <ClipboardList size={20} /> },
  { href: "/admin/customers", label: "Customers", icon: <Users size={20} /> },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

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
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
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
