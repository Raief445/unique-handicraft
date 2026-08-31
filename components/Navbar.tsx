"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, ChevronDown } from "lucide-react";
import { useEnquiryCart } from "./EnquiryCartContext";
import styles from "./Navbar.module.css";
import { useState } from "react";

export default function Navbar({ categories = [] }: { categories?: { id: string, name: string }[] }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const { itemCount, openCart } = useEnquiryCart();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">
            <img src="https://i.postimg.cc/Vs46MpNq/logo.png" alt="Unique Timber & Handicraft Logo" className={styles.logoImage} />
          </Link>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <div 
            className={styles.dropdownContainer}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link href="/products" className={styles.dropdownTrigger}>
              Products <ChevronDown size={14} className={styles.dropdownIcon} />
            </Link>
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link href="/products" className={styles.dropdownItem}>All Products</Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} className={styles.dropdownItem}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/about">About</Link>
          <Link href="/capabilities">Capabilities</Link>
          <Link href="/custom-manufacturing">Custom Manufacturing</Link>
          <Link href="/contact">Contact</Link>
          {isAdmin && <Link href="/admin" className={styles.adminLink}>Admin Panel</Link>}
        </nav>
        <div className={styles.actions}>
          {pathname === "/products" && (
            <button className={styles.actionLink} aria-label="Search">
              <Search size={18} strokeWidth={1.5} />
              <span>Search</span>
            </button>
          )}
          <button onClick={openCart} className={styles.cartIcon} aria-label="Enquiry Cart">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span>Enquiry Cart</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
