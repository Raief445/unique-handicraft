import Link from "next/link";
import styles from "./page.module.css";

export default function EnquirySuccessPage({
  searchParams,
}: {
  searchParams: { number?: string };
}) {
  const { number } = searchParams;

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1>Thank You for Your Enquiry</h1>
        <p className={styles.subtitle}>Your enquiry has been successfully submitted.</p>

        {number && (
          <div className={styles.enquiryNumber}>
            <span>Enquiry Number</span>
            <strong>{number}</strong>
          </div>
        )}

        <div className={styles.message}>
          <p>
            Our team will review your requirements and contact you regarding your enquiry.
            Please keep this enquiry number for your reference.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/products" className="btn-secondary">
            Back to Products
          </Link>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
