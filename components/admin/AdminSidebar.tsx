"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./AdminSidebar.module.css";
import {
  LayoutDashboard,
  Armchair,
  Folders,
  ClipboardList,
  Users,
  MessageSquare,
  Eye,
  Receipt,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function AdminSidebar({
  userEmail,
  unreadMessages = 0,
  newEnquiries = 0,
}: {
  userEmail: string;
  unreadMessages?: number;
  newEnquiries?: number;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/products", label: "Products", icon: <Armchair size={18} /> },
    { href: "/admin/categories", label: "Categories", icon: <Folders size={18} /> },
    {
      href: "/admin/enquiries",
      label: "Enquiries",
      icon: <ClipboardList size={18} />,
      badge: newEnquiries,
    },
    { href: "/admin/invoices", label: "Invoices", icon: <Receipt size={18} /> },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: <MessageSquare size={18} />,
      badge: unreadMessages,
    },
    { href: "/admin/customers", label: "Customers", icon: <Users size={18} /> },
    { href: "/admin/visitors", label: "Visitors", icon: <Eye size={18} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>Unique Timber</h2>
        <p>
          Handcrafted Heritage
          <span className={styles.brandBadge}>PORTAL</span>
        </p>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navItemContent}>
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={styles.badge}>{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <a
          href="https://uniquehandicrafts.in"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewSite}
        >
          <span>View Live Storefront</span>
          <ExternalLink size={14} />
        </a>

        <div className={styles.user}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
            </div>
            <span className={styles.userEmail} title={userEmail}>
              {userEmail || "Admin"}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={styles.logout}
            title="Sign out of admin panel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
