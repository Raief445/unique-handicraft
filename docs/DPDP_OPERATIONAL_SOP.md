# Standard Operating Procedure (SOP): DPDP Compliance & Data Protection Management
**Unique Timber & Handicraft**  
**Document Code:** SOP-DPDP-2026-V1  
**Effective Date:** November 2026  
**Applicability:** Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules, 2025  

---

## 1. Executive Summary & Purpose

Unique Timber & Handicraft operates a bespoke furniture manufacturing studio and export atelier based in Jodhpur, Rajasthan (`uniquehandicrafts.in`). As a Data Fiduciary under India's **Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)** and the **Digital Personal Data Protection Rules, 2025 (DPDP Rules, 2025)**, the business is dedicated to safeguarding digital personal data processed in the course of handling customer inquiries, quotations, orders, and statutory invoicing.

This Standard Operating Procedure (SOP) governs:
1. Operational procedures for handling customer privacy requests without requiring customer registration or login accounts.
2. The legal interface between DPDP erasure rights and mandatory tax retention under **Section 36 of the Central Goods and Services Tax Act, 2017 (CGST Act, 2017)**.
3. Incident response protocols distinguishing internal operational containment targets from statutory notification mandates.
4. Data fiduciary contacts, third-party data processor governance, and ongoing operational responsibilities.

---

## 2. Data Fiduciary Identity & Designated Governance

| Role | Details |
| :--- | :--- |
| **Data Fiduciary** | Unique Timber & Handicraft |
| **Principal Place of Business** | Basni Industrial Area, Phase II, Jodhpur, Rajasthan, India — 342005 |
| **Designated Contact** | Privacy & Grievance Officer, Unique Timber & Handicraft |
| **Official Privacy Email** | [uniquetimberhandicraftjodhpur@gmail.com](mailto:uniquetimberhandicraftjodhpur@gmail.com) |
| **Primary Website** | [https://uniquehandicrafts.in](https://uniquehandicrafts.in) |

---

## 3. Accountless Customer Access Model & Scope Boundaries

In accordance with business decisions and data minimization best practices:
- **Zero Customer Accounts:** Customers are **never** required to create an account, register, or maintain a password to browse catalogues, submit project specifications, or track manufacturing milestones.
- **Enquiry Submission Workflow:** Customers provide contact details (name, email, phone number, location, project requirements) strictly for receiving responses, pricing, and project updates.
- **Omission of Promotional Marketing:** The business does not operate marketing newsletters or mass automated promotional campaigns. Therefore, no marketing consent checkboxes or promotional databases are maintained. Any future promotional marketing would require separate, optional, affirmative consent recorded with verifiable audit logs.
- **Administrative Functions:** Dedicated admin credentials remain strictly restricted to authorized business management for managing catalogue items, milestone statuses, and GST billing.

---

## 4. Data Principal Rights & Request Handling Procedure

Data Principals (customers, prospective buyers, architects, interior designers) possess rights under the DPDP Act, including:
1. **Right to Access Information:** Summary of personal data processed and processing activities.
2. **Right to Correction & Updating:** Rectification of inaccurate, incomplete, or outdated personal data.
3. **Right to Erasure:** Deletion of personal data when the purpose of collection is fulfilled, subject to statutory retention obligations.
4. **Right of Grievance Redressal:** A readily accessible mechanism to address concerns or perceived non-compliance.
5. **Right to Nominate:** Designation of an individual to exercise rights in case of death or incapacity.

### Step-by-Step Handling Workflow

```
[Customer Email to uniquetimberhandicraftjodhpur@gmail.com]
                         │
                         ▼
        [Step 1: Intake & Logging]
  Log Date, Requester Email, Subject, Ref Number
                         │
                         ▼
     [Step 2: Accountless Identity Verification]
  Verify originating email matches Enquiry records / Invoice records
                         │
                         ▼
        [Step 3: Statutory & Business Audit]
  Check: Does an active order exist? Does an issued GST Invoice exist?
           ┌─────────────┴─────────────┐
           ▼                           ▼
[Only General Enquiry]          [Issued GST Tax Invoice]
  Purge enquiry from DB           Preserve Invoice under CGST Act s.36
  Confirm erasure via email       Purge non-statutory communication
                                  Issue partial erasure confirmation
                                  explaining legal tax retention
                         │
                         ▼
      [Step 4: Response & Communication]
  Acknowledge within 48-72 hrs; resolve without undue delay per DPDP Rules
```

### Step 1: Intake and Logging
- All privacy inquiries, erasure requests, or grievances received at `uniquetimberhandicraftjodhpur@gmail.com` must be logged in an internal Privacy Register with:
  - Timestamp of receipt.
  - Requester's name and contact email.
  - Nature of request (Access, Correction, Erasure, Grievance).
  - Relevant Enquiry Number(s) or Invoice Number(s).

### Step 2: Accountless Identity Verification
Because the website does not use passwords or customer accounts, the Privacy & Grievance Officer must verify the identity of the requester to prevent unauthorized data exposure:
- Verify that the requesting email address matches the email associated with the submitted enquiry or invoice.
- For high-sensitivity access requests, request secondary verification (e.g., verifying the Enquiry Reference Code, billing city, or phone number supplied during the order).

### Step 3: Statutory Audit & The CGST Act Section 36 Mandate
Before executing any erasure request, the Privacy & Grievance Officer must cross-reference whether the customer has been issued a commercial tax invoice:
- **General Enquiries (No Commercial Transaction):** If the customer only submitted an enquiry that did not convert into an invoice or ongoing dispute, the data in the `Enquiry` and `EnquiryItem` tables may be permanently erased from the operational database upon verified request.
- **Commercial Invoices (Mandatory Statutory Retention):**
  > **IMPORTANT LEGAL MANDATE:** Under **Section 36 of the Central Goods and Services Tax Act, 2017 (CGST Act)**, every registered person must keep and maintain books of account and other records until the expiry of **72 months (six years)** from the due date of furnishing of annual return for the year pertaining to such accounts and records.
  >
  > Because annual returns under the CGST Act are furnished by December 31 following the close of the financial year, the effective statutory retention period spans approximately **7 to 8 years** from the date of invoice issuance.
  >
  > Furthermore, where records are subject to an appeal, revision, investigation, or ongoing proceedings before an appellate authority or court, records must be retained until final disposal.
- **Rule of Action:** Invoices generated in `/admin/invoices` and customer billing details linked to GST filings **must NEVER be automatically deleted** pursuant to a DPDP erasure request.
- **Communication Protocol for Invoiced Customers:** When an invoiced customer requests erasure, the Privacy & Grievance Officer shall:
  1. Purge marketing contacts or non-statutory enquiry records.
  2. Maintain tax invoices and required customer billing records in a secured archive.
  3. Respond in writing explaining that statutory tax and accounting records are legally retained under Section 36 of the CGST Act, 2017, citing the specific statutory authority.

### Step 4: Resolution Timelines
- **Initial Acknowledgment:** The Privacy & Grievance Officer should acknowledge receipt of the request within **48 to 72 business hours**.
- **Execution & Final Reply:** Requests shall be evaluated and resolved **without undue delay** within the statutory timelines established by the DPDP Rules upon their phased notification, keeping the data principal updated in case of complex investigations or legal hold audits.

---

## 5. Third-Party Processor Governance

Unique Timber & Handicraft engages reputable service providers as Data Processors. The data processing activities are limited strictly to infrastructure, communication, and basic analytics:

| Service Provider | Function / Role | Data Location | Security Controls |
| :--- | :--- | :--- | :--- |
| **Vercel Inc.** | Application Hosting & Edge Routing | Global Edge / AWS US/EU CDN | HTTPS/TLS 1.3, DDoS protection, edge security isolation. |
| **Supabase Inc.** | PostgreSQL Relational Database | AWS `ap-south-1` (Mumbai, India) | Row-Level Security, TLS encryption in transit, AES-256 at rest, restricted IP pools. |
| **Google LLC (Gmail SMTP)** | Transactional Confirmation Emails | Google Cloud Infrastructure | TLS transmission, OAuth2/App password authentication, enterprise mail security. |
| **Google LLC (GTM)** | Basic Aggregate Website Measurement | Google Cloud Infrastructure | IP anonymization, client-side aggregate analytics. |

Data Processors process data solely under instructions from Unique Timber & Handicraft to fulfill customer requests.

---

## 6. Security Incident & Data Breach Management

This section establishes an incident response protocol that clearly separates internal operational response targets from statutory notification mandates.

### Phase 1: Detection & Triage
- **Trigger:** Suspicious database access, compromised administrative credentials, anomalous rate-limit spikes, or notifications from infrastructure providers (Vercel, Supabase).
- **Escalation:** Immediate escalation to the Privacy & Grievance Officer.

### Phase 2: Containment & Evidence Preservation (Internal Operational Target)
- **Internal Target:** The business aims to achieve operational containment within **6 hours** of initial detection.
  > *Note: This 6-hour containment window is an internal operational target for technical triage, not a statutory reporting deadline.*
- **Actions:**
  - Rotate database credentials and API keys in Vercel and Supabase.
  - Invalidate active administrative session cookies.
  - Preserve server logs, IP connection records, and error traces for digital forensic evidence.

### Phase 3: Impact Assessment
- Evaluate categories of personal data involved (e.g., enquiry names, contact emails, order specifications).
- Determine whether data integrity, confidentiality, or availability was compromised.
- Assess potential harm or impact on affected data principals.

### Phase 4: Regulatory & Individual Notification
- **Data Protection Board of India (DPBI):** Where a personal data breach is determined to require reporting under the DPDP Act and the notified DPDP Rules, formal notice will be submitted to the Board in the prescribed form and manner within the applicable statutory timelines in force.
- **Affected Individuals:** Notice shall be communicated to affected data principals via their registered email address where required by law, detailing:
  - Nature of the breach.
  - Categories of personal data affected.
  - Recommended precautionary steps for the individual.
  - Contact coordinates of the Privacy & Grievance Officer for inquiries.

---

## 7. Technical Security Safeguards Implemented

1. **Persistent Atomic Rate Limiting:**
   - Public tracking endpoints (`/track-enquiry`) enforce IP-based rate limiting (5 lookups per 15 minutes) backed by PostgreSQL (`RateLimit` table).
   - Protects against brute-force enumeration of customer reference codes across serverless deployments.
2. **Personal Data Redaction on Public Tracking:**
   - Customer phone numbers and email addresses are masked/redacted on `/track-enquiry` views (`•••••• 1234`, `j***h@gmail.com`).
3. **Generic Error Responses:**
   - Lookup failures return generic notices that do not reveal whether an enquiry reference number or email address exists in the system.
4. **Transparent Pre-Submit Notices:**
   - Privacy notices positioned before submission actions on `/contact`, `/enquiry`, and `/track-enquiry` linking directly to `/privacy-policy`.
5. **Role-Based Access for Invoicing & Administration:**
   - Customer-facing interfaces provide zero access to financial or tax accounting records; all invoice generation and customer billing management require verified administrative authentication.

---

## 8. Annual Review and Audit

This SOP shall be reviewed annually or upon the notification of additional rules, codes of practice, or guidelines by the Ministry of Electronics and Information Technology (MeitY) or the Data Protection Board of India.

**Document Owner:** Privacy & Grievance Officer, Unique Timber & Handicraft  
**Contact:** [uniquetimberhandicraftjodhpur@gmail.com](mailto:uniquetimberhandicraftjodhpur@gmail.com)
