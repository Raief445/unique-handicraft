"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, ChevronDown, Menu, X } from "lucide-react";
import { useEnquiryCart } from "./EnquiryCartContext";
import styles from "./Navbar.module.css";
import { useState } from "react";

export default function Navbar({ categories = [] }: { categories?: { id: string, name: string }[] }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const { itemCount, openCart } = useEnquiryCart();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">
            <Image src="https://i.postimg.cc/Vs46MpNq/logo.png" alt="Unique Timber & Handicraft Logo" width={250} height={50} priority className={styles.logoImage} />
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
          <Link href="/track-enquiry">Track Enquiry</Link>
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
            <span className={styles.cartText}>Enquiry Cart</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
          <button className={styles.hamburgerBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNavLinks}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <div className={styles.mobileDropdown}>
              <div className={styles.mobileDropdownTitle}>Products</div>
              <div className={styles.mobileDropdownList}>
                <Link href="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)}>
                    - {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</Link>
            <Link href="/custom-manufacturing" onClick={() => setMobileMenuOpen(false)}>Custom Manufacturing</Link>
            <Link href="/track-enquiry" onClick={() => setMobileMenuOpen(false)}>Track Enquiry</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {isAdmin && <Link href="/admin" className={styles.adminLink} onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
