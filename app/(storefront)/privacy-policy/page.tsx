import { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";
import { ShieldCheck, Mail, MapPin, Phone, Clock, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | Unique Timber & Handicraft",
  },
  description:
    "Information regarding personal data collection, processing purposes, statutory retention, and data principal rights under India's Digital Personal Data Protection Act, 2023.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroEyebrow}>LEGAL & PRIVACY NOTICES</div>
          <h1>Privacy Policy</h1>
          <p className={styles.heroSubtitle}>
            Our commitment to transparency, data protection, and responsible craftsmanship under India&apos;s Digital Personal Data Protection Act, 2023.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.contentContainer}>
        {/* Status Bar */}
        <div className={styles.lastUpdatedBar}>
          <div>
            <strong>Effective Date:</strong> November 2026 &bull; Operating entity: <strong>Unique Timber &amp; Handicraft</strong>
          </div>
          <div className={styles.complianceBadge}>
            <ShieldCheck size={16} /> DPDP Framework Aligned
          </div>
        </div>

        {/* 1. Introduction & Business Identity */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2>Business Identity &amp; Application Scope</h2>
          </div>
          <p>
            <strong>Unique Timber &amp; Handicraft</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a solid wood furniture manufacturing and handicraft enterprise based in Jodhpur, Rajasthan, India, operating since 2015. We operate the website <Link href="/" style={{ textDecoration: "underline", color: "inherit" }}>uniquehandicrafts.in</Link> as an architectural showcase, bespoke enquiry portal, and B2B quotation service.
          </p>
          <p>
            This Privacy Policy sets out how we collect, handle, process, and protect your digital personal data when you browse our catalogue, contact our atelier, submit a project requirement enquiry, or receive a commercial quotation or GST tax invoice.
          </p>
          <div className={styles.calloutCard}>
            <p>
              <strong>Accountless Experience:</strong> Unique Timber &amp; Handicraft does not require customers to create accounts, set passwords, or log in to browse pieces, submit requirements, track enquiry progress, or receive invoices. All interactions are handled on an enquiry-specific basis.
            </p>
          </div>
        </article>

        {/* 2. Personal Data Collected */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2>Personal Data We Collect</h2>
          </div>
          <p>
            In alignment with the principle of data minimization under Section 6 of the Digital Personal Data Protection Act, 2023 (DPDP Act), we only collect personal information strictly necessary to fulfill your enquiries and statutory commercial obligations:
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Collection Point</th>
                  <th>Personal Data Categories</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Contact Form</strong></td>
                  <td>Full Name, Company / Studio Name, Email Address, Phone Number (optional), Subject, Message</td>
                  <td>Responding to direct inquiries, partnerships, and technical questions.</td>
                </tr>
                <tr>
                  <td><strong>Project Enquiry Form</strong></td>
                  <td>Full Name, Company Name, Designation (optional), Email Address, Phone / WhatsApp Number, Delivery City &amp; Country, Expected Quantity, Target Delivery Date, Customization Specs, Reference Files (drawings/photos)</td>
                  <td>Reviewing artisan feasibility, sizing raw timber (Mango, Acacia, Sheesham, Walnut), preparing formal quotations, and manufacturing coordination.</td>
                </tr>
                <tr>
                  <td><strong>Enquiry Tracking</strong></td>
                  <td>Enquiry Reference Number &amp; Registered Email Address</td>
                  <td>Authenticating access to real-time workshop milestones. Displays only project stages and furniture specs; phone numbers and emails are never exposed.</td>
                </tr>
                <tr>
                  <td><strong>Commercial Invoicing</strong> (for confirmed orders)</td>
                  <td>Billing Name, Delivery Address, Place of Supply (State), Phone Number, Email, Consumer / Business GSTIN (if provided)</td>
                  <td>Generating legal Tax Invoices, Bills of Supply, or Proforma Invoices, computing CGST/SGST/IGST, and fulfilling statutory accounting laws.</td>
                </tr>
                <tr>
                  <td><strong>Technical Telemetry</strong></td>
                  <td>IP Address, Browser User-Agent, Requested URL, Timestamp</td>
                  <td>Serverless rate limiting to prevent automated form abuse, system security, and troubleshooting.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        {/* 3. Purpose of Processing & Non-Marketing Commitment */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2>Purpose of Processing &amp; Commercial Communication</h2>
          </div>
          <p>
            We process your personal data solely for legitimate, enquiry-related business purposes:
          </p>
          <ul>
            <li>To formulate bespoke quotations, material estimates, and timber lead times.</li>
            <li>To communicate directly with you regarding dimensions, finishes, packaging, and logistics.</li>
            <li>To verify and confirm bank transfer deposits against issued proforma invoices.</li>
            <li>To comply with mandatory tax, accounting, and audit statutes under Indian commercial law.</li>
            <li>To protect our web infrastructure from automated scraping, credential stuffing, and brute-force attacks.</li>
          </ul>
          <div className={styles.calloutCard}>
            <p>
              <strong>No Unsolicited Marketing Broadcasts:</strong> Submitting a product inquiry or message will <em>never</em> automatically enroll you in promotional marketing campaigns, newsletter blasts, or third-party advertising databases. We do not sell, rent, or trade your personal data.
            </p>
          </div>
        </article>

        {/* 4. Verified Third-Party Processors */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>04</span>
            <h2>Third-Party Data Processors &amp; Infrastructure</h2>
          </div>
          <p>
            We engage carefully selected infrastructure partners to maintain high availability and security. Each provider processes personal data strictly as necessary for their specific function:
          </p>
          <ul>
            <li>
              <strong>Hosting &amp; Edge Network (Vercel Inc.):</strong> Delivers the application through secure edge endpoints, handling transport encryption (TLS 1.3) and temporary HTTP request routing.
            </li>
            <li>
              <strong>Database Infrastructure (Supabase / Amazon Web Services):</strong> Managed PostgreSQL database located in AWS Asia-South-1 (Mumbai, India). Stores customer enquiries, tax invoice snapshots, and visitor security logs.
            </li>
            <li>
              <strong>Transactional Email (Google Workspace / Gmail SMTP):</strong> Delivers automated enquiry receipt confirmations and workshop notification emails via encrypted SMTP (`smtp.gmail.com`).
            </li>
            <li>
              <strong>Website Analytics (Google Tag Manager &amp; Google Analytics 4):</strong> We deploy Google Tag Manager (container `GTM-NHKSZNVD`) configured with a Google Analytics 4 measurement stream (`G-R4K0ECPV70`) to evaluate aggregate site traffic, popular product categories, and general navigation patterns. When you visit our website, Google processes technical browsing telemetry, including browser and device attributes, approximate geographical location derived from IP address, and pseudonymous client identifiers (`_ga` cookies). This telemetry is processed by Google LLC in accordance with Google&apos;s Privacy Policy. We do not use this data to personally identify individual visitors.
            </li>
            <li>
              <strong>Authoritative DNS (GoDaddy):</strong> Translates `uniquehandicrafts.in` domain queries; does not process customer personal information.
            </li>
          </ul>
          <p>
            Our core database hosting is located in Mumbai, India. Any cross-border infrastructure routing adheres to Section 16 of the DPDP Act and prevailing Central Government notifications.
          </p>
        </article>

        {/* 5. Data Retention & Statutory Accounting Exceptions */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>05</span>
            <h2>Data Retention &amp; Statutory Accounting Obligations</h2>
          </div>
          <p>
            We retain personal data only for as long as necessary to fulfill the purpose of collection or comply with statutory requirements:
          </p>
          <ul>
            <li>
              <strong>Unfulfilled Enquiries &amp; General Messages:</strong> Retained during active discussions and design consultations. Closed or inactive enquiries are archived and eligible for manual deletion upon request.
            </li>
            <li>
              <strong>Statutory Tax Invoices &amp; Order Records (Mandatory Legal Exception):</strong> Under <strong>Section 36 of the Central Goods and Services Tax (CGST) Act, 2017</strong>, every registered taxable person is required to maintain all accounts, commercial correspondence, and tax invoices for at least <strong>72 months from the due date of furnishing the annual return (GSTR-9)</strong> for the relevant financial year (and longer in the event of an ongoing audit, appeal, or litigation).
            </li>
          </ul>
          <div className={styles.calloutCard}>
            <p>
              <strong>Important Notice on Erasure:</strong> Pursuant to Section 8(7) and Section 12(3) of the DPDP Act, the right to erasure does not override statutory retention obligations mandated by tax and corporate statutes. While non-essential enquiry communications can be erased upon request, records forming part of issued GST Tax Invoices must be preserved for statutory audit periods.
            </p>
          </div>
        </article>

        {/* 6. Reasonable Security Safeguards */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>06</span>
            <h2>Security Safeguards (Section 8(5), DPDP Act)</h2>
          </div>
          <p>
            We implement reasonable technical, operational, and organizational security safeguards to prevent personal data breaches:
          </p>
          <ul>
            <li><strong>Transport Encryption:</strong> All data transmitted between your browser and our servers is encrypted using modern TLS (HTTPS) standards.</li>
            <li><strong>Administrative Role-Based Access Control (RBAC):</strong> Access to customer enquiry records, files, and billing data is strictly confined to authenticated administrators via cryptographically salted bcrypt password hashes and secure JSON Web Tokens.</li>
            <li><strong>Persistent Rate Limiting:</strong> Inquiry tracking and submission endpoints are protected by database-backed rate limiters to resist brute-force enumeration.</li>
            <li><strong>Data Redaction on Tracking:</strong> Our public inquiry lookup page never outputs customer phone numbers, email addresses, billing addresses, or internal artisan notes.</li>
          </ul>
        </article>

        {/* 7. Data Principal Rights & Grievance Redressal */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>07</span>
            <h2>Your Rights &amp; Grievance Redressal</h2>
          </div>
          <p>
            Under India&apos;s Digital Personal Data Protection Act, 2023, you have recognized rights regarding the personal data we process:
          </p>
          <ol>
            <li><strong>Right to Access:</strong> You may request a summary of the personal data being processed about you and the processing activities undertaken.</li>
            <li><strong>Right to Correction &amp; Updating:</strong> You may request the correction of inaccurate or incomplete personal information.</li>
            <li><strong>Right to Erasure:</strong> You may request the erasure of your personal data where retention is no longer necessary for the original enquiry purpose and not precluded by statutory tax laws.</li>
            <li><strong>Right to Grievance Redressal:</strong> You may raise questions or grievances regarding personal data processing with our designated officer.</li>
            <li><strong>Right to Nominate:</strong> You may designate another individual to exercise these rights on your behalf in the event of death or incapacity.</li>
          </ol>

          <h3>How to Exercise Your Rights (No Account Required)</h3>
          <p>
            Because we do not require customer logins, you can exercise any of your rights simply by writing to our designated desk from your registered email address. For security and verification, please include your full name and your unique <strong>Enquiry Reference Number</strong> (e.g. `ENQ-XXXX-123`) or relevant invoice number.
          </p>

          <div className={styles.contactBox}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Designation:</span>
              <span className={styles.contactValue}>Privacy &amp; Grievance Officer, Unique Timber &amp; Handicraft</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Official Email:</span>
              <span className={styles.contactValue}>
                <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com">uniquetimberhandicraftjodhpur@gmail.com</a>
              </span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Telephone / WhatsApp:</span>
              <span className={styles.contactValue}>+91 94141 33434</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Physical Atelier:</span>
              <span className={styles.contactValue}>G-128, RIICO Industrial Area, Phase II, Basni, Jodhpur, Rajasthan 342005, India</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Response Policy:</span>
              <span className={styles.contactValue}>Requests and grievances will be acknowledged promptly and resolved without undue delay, in accordance with applicable timelines under the DPDP Rules upon their notification.</span>
            </div>
          </div>
        </article>

        {/* 8. Policy Updates */}
        <article className={styles.policySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>08</span>
            <h2>Updates to This Policy</h2>
          </div>
          <p>
            We may revise this Privacy Policy periodically to reflect technological updates, workshop operational changes, or amendments to statutory rules issued by the Ministry of Electronics and Information Technology (MeitY) or the Central Government of India. The updated policy will be posted on this page with an updated effective date.
          </p>
        </article>
      </main>
    </div>
  );
}

