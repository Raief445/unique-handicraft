import { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | Unique Timber & Handicraft",
  },
  description:
    "Privacy Policy for Unique Timber & Handicraft, Jodhpur. Information on personal data collection, enquiry handling, analytics, and privacy requests.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>LEGAL &amp; PRIVACY</div>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          How Unique Timber &amp; Handicraft collects, uses, and protects your information when you visit our website, submit project enquiries, or order custom furniture.
        </p>
        <span className={styles.meta}>Effective: November 2026</span>
      </header>

      {/* About This Policy */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About This Policy</h2>
        <p className={styles.paragraph}>
          Unique Timber &amp; Handicraft (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a solid wood furniture and handicraft manufacturing enterprise based in Jodhpur, Rajasthan. We operate <Link href="/" className={styles.link}>uniquehandicrafts.in</Link> to showcase our furniture collections and facilitate wholesale, B2B, and custom manufacturing enquiries.
        </p>
        <p className={styles.paragraph}>
          This Privacy Policy outlines how we handle personal data when you browse our website or communicate with us. As India implements the Digital Personal Data Protection Act, 2023 (DPDP Act), we are committed to transparent, fair, and responsible data practices.
        </p>
      </section>

      {/* Information We Collect */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Information We Collect</h2>
        <p className={styles.paragraph}>
          We collect only the information necessary to respond to your requests, prepare quotations, and fulfill orders:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Contact Details:</strong> Your name, company name, email address, phone or WhatsApp number, and delivery city and country when you contact us or submit an enquiry.
          </li>
          <li>
            <strong>Project Specifications:</strong> Selected furniture pieces, quantities, custom dimensions, timber and finish preferences, and project notes, as well as any reference drawings or photographs you choose to share.
          </li>
          <li>
            <strong>Billing Information:</strong> If an enquiry proceeds to an order, we collect business billing details required for commercial invoicing, including your registered business name, billing address, and GSTIN where applicable.
          </li>
          <li>
            <strong>Website Telemetry:</strong> Standard internet access information, such as your browser type, device type, referring page, and approximate location derived from your IP address, to ensure website stability.
          </li>
        </ul>
      </section>

      {/* How We Use Your Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
        <p className={styles.paragraph}>
          We use your information strictly for legitimate commercial and operational purposes:
        </p>
        <ul className={styles.list}>
          <li>To review your project requirements and provide quotations.</li>
          <li>To communicate regarding custom designs, production timelines, and delivery.</li>
          <li>To dispatch transactional emails, such as enquiry confirmations.</li>
          <li>To generate statutory tax invoices and maintain required accounting records.</li>
          <li>To protect our website and systems against malicious activity.</li>
        </ul>
        <p className={styles.paragraph}>
          We do not sell, rent, or trade your personal information, and we do not send automated promotional marketing broadcasts.
        </p>
      </section>

      {/* Enquiries and Orders */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Enquiries and Orders</h2>
        <p className={styles.paragraph}>
          Our website does not require customer registration or accounts. You can browse products, assemble a project list, and submit enquiries without creating a password. If you use our <Link href="/track-enquiry" className={styles.link}>Track Enquiry</Link> feature, we use your enquiry reference code and registered email address solely to retrieve and display the progress of your enquiry or project securely.
        </p>
      </section>

      {/* Local Storage, Cookies and Analytics */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Local Storage, Cookies and Analytics</h2>
        <p className={styles.paragraph}>
          We use browser local storage to remember items added to your enquiry cart as you navigate between pages. This data remains on your device and is not used for tracking.
        </p>
        <p className={styles.paragraph}>
          We also use Google Analytics to help us understand general website traffic and how visitors browse our collections. Google Analytics uses cookies and pseudonymous device identifiers to measure website activity. This information is processed in accordance with Google&apos;s Privacy Policy and is not used by us to personally identify individual visitors. You can manage or disable cookies through your browser settings.
        </p>
      </section>

      {/* Third-Party Services */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Third-Party Services</h2>
        <p className={styles.paragraph}>
          We work with trusted third-party service providers who assist us in hosting and maintaining our website, securely storing data, and delivering emails. These providers process information on our behalf strictly to help us operate our services and respond to customer requests.
        </p>
      </section>

      {/* Data Retention */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Retention</h2>
        <p className={styles.paragraph}>
          We retain personal data only for as long as reasonably necessary to fulfill the purposes for which it was collected, manage ongoing client communications, or satisfy legal requirements:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Enquiry Records:</strong> Contact details and project specifications are retained as long as reasonably necessary for business purposes and follow-up communication.
          </li>
          <li>
            <strong>Tax and Invoicing Records:</strong> Under Section 36 of the Central Goods and Services Tax Act, 2017 (CGST Act), accounts and records linked to tax invoices must be retained for at least 72 months from the due date of furnishing the annual return for the relevant financial year. Records required to be retained under applicable tax laws will be preserved for the statutory period, even if a deletion request is received.
          </li>
        </ul>
      </section>

      {/* Data Security */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Security</h2>
        <p className={styles.paragraph}>
          We maintain reasonable administrative and technical safeguards designed to protect personal data against unauthorized access, loss, misuse, or alteration.
        </p>
      </section>

      {/* Privacy Requests and Grievances */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Privacy Requests and Grievances</h2>
        <p className={styles.paragraph}>
          You may contact us at any time to review, correct, or request the deletion of your contact and enquiry information, subject to applicable legal and tax retention requirements. Because we do not operate customer accounts, we will verify your identity via your registered email address before fulfilling requests. We will review and address your inquiry promptly.
        </p>
      </section>

      {/* Contact Details */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Details</h2>
        <p className={styles.paragraph}>
          If you have any questions regarding this Privacy Policy or wish to make a privacy request, please contact our designated officer:
        </p>
        <div className={styles.contactInfo}>
          <p><strong>Privacy &amp; Grievance Officer</strong></p>
          <p>Unique Timber &amp; Handicraft</p>
          <p>G-128, RIICO Industrial Area, Phase II, Basni</p>
          <p>Jodhpur, Rajasthan 342005, India</p>
          <p>
            Email:{" "}
            <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com" className={styles.link}>
              uniquetimberhandicraftjodhpur@gmail.com
            </a>
          </p>
          <p>
            Website:{" "}
            <Link href="/" className={styles.link}>
              https://uniquehandicrafts.in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
