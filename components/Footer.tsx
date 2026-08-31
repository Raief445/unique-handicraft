import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerBrand}>
          <h3>Unique Timber & Handicraft</h3>
          <p>Jodhpur, Rajasthan, India</p>
          <p>Working Since: 2019</p>
          <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com" className={styles.footerEmail}>
            uniquetimberhandicraftjodhpur@gmail.com
          </a>
        </div>
        
        <div className={styles.footerLinks}>
          <div className={styles.linkColumn}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className={styles.linkColumn}>
            <h4>Services</h4>
            <ul>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/capabilities">Capabilities</Link></li>
              <li><Link href="/custom-manufacturing">Custom Manufacturing</Link></li>
              <li><Link href="/track-enquiry">Track Enquiry</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={styles.copyright}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Unique Timber & Handicraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
