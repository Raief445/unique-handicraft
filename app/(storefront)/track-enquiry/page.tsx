import prisma from "@/lib/db";
import Link from "next/link";
import styles from "./track.module.css";
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Mail,
  User,
  Package,
  Sparkles,
  FileText,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { Metadata } from "next";
import { CopyEnquiryButton, PrintButton } from "./TrackClientActions";

export const metadata: Metadata = {
  title: "Track Your Enquiry | Unique Timber & Handicraft",
  description:
    "Check real-time manufacturing and review status of your bespoke furniture and handicraft enquiry.",
  alternates: {
    canonical: "/track-enquiry",
  },
};

export const dynamic = "force-dynamic";

// Primary enquiry milestone pipeline
const MILESTONE_STAGES = [
  { key: "NEW", label: "Received", step: "01", hint: "Logged into system" },
  { key: "CONTACTED", label: "Contacted", step: "02", hint: "Under review" },
  { key: "REQUIREMENT_DISCUSSION", label: "Discussion", step: "03", hint: "Specs & custom design" },
  { key: "QUOTATION_SENT", label: "Quotation", step: "04", hint: "Proposal dispatched" },
  { key: "NEGOTIATION", label: "Negotiation", step: "05", hint: "Terms & timeline" },
  { key: "CONFIRMED", label: "Confirmed", step: "06", hint: "In production" },
  { key: "COMPLETED", label: "Fulfilled", step: "07", hint: "Ready / Delivered" },
];

const STATUS_CONFIG: Record<
  string,
  {
    title: string;
    badgeStyle: string;
    description: string;
    nextStep?: string;
  }
> = {
  NEW: {
    title: "Enquiry Received",
    badgeStyle: styles.badgeNew,
    description:
      "Your enquiry has been received and logged into our atelier system. Our design and estimation team will review your specifications shortly.",
    nextStep: "Our concierge team will review requirements and initiate personal contact.",
  },
  CONTACTED: {
    title: "Contacted / Under Review",
    badgeStyle: styles.badgeContacted,
    description:
      "Our team has reviewed your enquiry and initiated contact with you. We look forward to discussing your project and custom requirements.",
    nextStep: "We will discuss dimensions, wood selection, marble finishes, and required quantities.",
  },
  REQUIREMENT_DISCUSSION: {
    title: "Requirement Discussion",
    badgeStyle: styles.badgeDiscussion,
    description:
      "We are currently reviewing and discussing specific dimensions, wood species, finishes, and order details with you.",
    nextStep: "Our team will calculate artisan workshop timelines and generate a formal commercial quotation.",
  },
  QUOTATION_SENT: {
    title: "Quotation Dispatched",
    badgeStyle: styles.badgeQuotation,
    description:
      "A formal price quotation has been prepared and issued for your requested items. Please review the proposal details sent to your registered email.",
    nextStep: "Review your quotation and notify us if you wish to confirm or request design adjustments.",
  },
  NEGOTIATION: {
    title: "Commercial Negotiation",
    badgeStyle: styles.badgeNegotiation,
    description:
      "We are working together with you on finalizing commercial terms, production schedules, and volume pricing to reach an optimal agreement.",
    nextStep: "Once terms are agreed, we will prepare your proforma invoice and production schedule.",
  },
  CONFIRMED: {
    title: "Order Confirmed & In Production",
    badgeStyle: styles.badgeConfirmed,
    description:
      "Your order has been officially confirmed! Our master craftsmen in Jodhpur have scheduled raw timber selection and artisan manufacturing.",
    nextStep: "Artisanal handcrafting and quality control inspections prior to export packaging.",
  },
  COMPLETED: {
    title: "Order Completed & Fulfilled",
    badgeStyle: styles.badgeCompleted,
    description:
      "Your order/enquiry has been successfully completed and fulfilled. Thank you for partnering with Unique Timber & Handicraft!",
    nextStep: "We hope you enjoy your handcrafted pieces. Reach out anytime for future bespoke commissions.",
  },
  CLOSED: {
    title: "Enquiry Closed / Archived",
    badgeStyle: styles.badgeClosed,
    description:
      "This enquiry has been closed or archived. If you have any further questions, future requirements, or wish to reopen this discussion, please reach out to us anytime.",
  },
};

export default async function TrackEnquiryPage({
  searchParams,
}: {
  searchParams: { enquiryNumber?: string; email?: string };
}) {
  const { enquiryNumber, email } = searchParams;

  let enquiry = null;
  let error = null;

  if (enquiryNumber && email) {
    try {
      enquiry = await prisma.enquiry.findFirst({
        where: {
          enquiryNumber: enquiryNumber.trim().toUpperCase(),
          email: { equals: email.trim(), mode: "insensitive" },
        },
        include: {
          items: true,
        },
      });

      if (!enquiry) {
        error =
          "No enquiry was found matching this reference number and email address. Please double-check your entries.";
      }
    } catch (err) {
      error =
        "A temporary error occurred while retrieving your enquiry. Please refresh or try again in a few moments.";
    }
  }

  // Determine current milestone index
  const currentStatus = enquiry?.status || "NEW";
  const statusInfo =
    STATUS_CONFIG[currentStatus] || {
      title: currentStatus.replace(/_/g, " "),
      badgeStyle: styles.badgeNew,
      description: "Enquiry is currently being processed by our team.",
    };

  const currentStageIndex = MILESTONE_STAGES.findIndex(
    (stage) => stage.key === currentStatus
  );
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const isClosed = currentStatus === "CLOSED";

  // Calculate percentage for progress bars
  const progressPercent = isClosed
    ? 100
    : Math.round(((activeIndex + 1) / MILESTONE_STAGES.length) * 100);

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <span className={styles.heroEyebrow}>Client Concierge & Tracking</span>
          <h1 className={styles.heroTitle}>Track Your Enquiry</h1>
          <p className={styles.heroSubtitle}>
            Follow the live manufacturing, review, and quotation progress of your bespoke
            furniture and artisanal handicraft orders.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.main}>
        <div className={styles.container}>
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={20} className={styles.errorIcon} />
              <div>
                <strong>Enquiry Not Found</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!enquiry ? (
            /* Search & Lookup Form View */
            <div className={styles.lookupCard}>
              <div className={styles.lookupHeader}>
                <div className={styles.lookupBadge}>
                  <ShieldCheck size={16} />
                  <span>Secure Client Portal</span>
                </div>
                <h2>Look Up Your Enquiry</h2>
                <p>
                  Enter your unique enquiry reference number and the email address used during
                  submission to view full status and specifications.
                </p>
              </div>

              <form action="/track-enquiry" method="GET" className={styles.form}>
                <div className={styles.formField}>
                  <label htmlFor="enquiryNumber">
                    Enquiry Reference Number <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <FileText size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="enquiryNumber"
                      name="enquiryNumber"
                      placeholder="e.g. ENQ-M33N-264"
                      defaultValue={enquiryNumber || ""}
                      className={styles.input}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    Format: ENQ-XXXX-123 (found in your confirmation email)
                  </span>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="email">
                    Registered Email Address <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="e.g. name@company.com"
                      defaultValue={email || ""}
                      className={styles.input}
                      required
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    The email address where confirmation was received
                  </span>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Search size={18} />
                  <span>Track Enquiry Status</span>
                </button>
              </form>

              {/* Guidance / FAQ box */}
              <div className={styles.helpBox}>
                <div className={styles.helpHeader}>
                  <HelpCircle size={18} className={styles.helpIcon} />
                  <h4>Where do I find my Enquiry Reference?</h4>
                </div>
                <p>
                  Your unique reference code was dispatched to your email address immediately
                  upon submitting your enquiry on our website. Please check your inbox or search
                  for <strong>Unique Timber & Handicraft</strong>.
                </p>
                <div className={styles.helpFooter}>
                  <span>Need help locating your enquiry?</span>
                  <a
                    href="mailto:uniquetimberhandicraftjodhpur@gmail.com"
                    className={styles.helpLink}
                  >
                    Contact Concierge →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Enquiry Result Tracking View */
            <div className={styles.trackingView}>
              {/* Top Navigation & Actions */}
              <div className={styles.topNav}>
                <Link href="/track-enquiry" className={styles.backLink}>
                  <ArrowLeft size={16} />
                  <span>Look Up Another Enquiry</span>
                </Link>

                <div className={styles.topActions}>
                  <PrintButton />
                </div>
              </div>

              {/* Master Overview Card */}
              <div className={styles.overviewCard}>
                <div className={styles.overviewHeader}>
                  <div className={styles.refBlock}>
                    <span className={styles.refLabel}>Enquiry Reference</span>
                    <div className={styles.refNumberRow}>
                      <h2 className={styles.refNumber}>{enquiry.enquiryNumber}</h2>
                      <CopyEnquiryButton text={enquiry.enquiryNumber} />
                    </div>
                    <div className={styles.dateMeta}>
                      <span>
                        <Calendar size={13} />
                        Submitted:{" "}
                        {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className={styles.dotSeparator}>•</span>
                      <span>
                        <Clock size={13} />
                        Last Updated:{" "}
                        {new Date(enquiry.updatedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.statusBlock}>
                    <span className={styles.statusLabel}>Current Status</span>
                    <div className={`${styles.statusBadge} ${statusInfo.badgeStyle}`}>
                      <span className={styles.statusPulseDot}></span>
                      {statusInfo.title}
                    </div>
                  </div>
                </div>

                {/* Status Narrative Callout */}
                <div className={styles.statusCallout}>
                  <div className={styles.statusCalloutHeader}>
                    <CheckCircle2 size={18} className={styles.statusCalloutIcon} />
                    <h4>Current Phase: {statusInfo.title}</h4>
                  </div>
                  <p className={styles.statusCalloutText}>{statusInfo.description}</p>
                  {statusInfo.nextStep && (
                    <div className={styles.nextStepRow}>
                      <span className={styles.nextStepBadge}>NEXT STEP</span>
                      <p className={styles.nextStepText}>{statusInfo.nextStep}</p>
                    </div>
                  )}
                </div>

                {/* Progress Stepper Section */}
                <div className={styles.stepperSection}>
                  <div className={styles.stepperHeader}>
                    <h3>Production & Review Timeline</h3>
                    {!isClosed && (
                      <span className={styles.stepperProgressText}>
                        Stage {activeIndex + 1} of {MILESTONE_STAGES.length}
                      </span>
                    )}
                  </div>

                  {isClosed ? (
                    <div className={styles.closedNotice}>
                      <AlertTriangle size={18} />
                      <span>This enquiry is marked as Closed / Archived.</span>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Horizontal Stepper (shown on desktop >= 769px) */}
                      <div className={styles.desktopStepper} aria-label="Order progress">
                        <div className={styles.stepperTrack}>
                          <div
                            className={styles.stepperFill}
                            style={{
                              width: `${(activeIndex / (MILESTONE_STAGES.length - 1)) * 100}%`,
                            }}
                          />
                        </div>

                        <div className={styles.stepsRow}>
                          {MILESTONE_STAGES.map((stage, idx) => {
                            const isDone = idx < activeIndex;
                            const isCurrent = idx === activeIndex;

                            return (
                              <div
                                key={stage.key}
                                className={`${styles.stepNode} ${
                                  isDone
                                    ? styles.stepDone
                                    : isCurrent
                                    ? styles.stepCurrent
                                    : styles.stepUpcoming
                                }`}
                              >
                                <div className={styles.stepCircle}>
                                  {isDone ? (
                                    <Check size={14} strokeWidth={2.5} />
                                  ) : (
                                    <span>{stage.step}</span>
                                  )}
                                </div>
                                <span className={styles.stepLabel}>{stage.label}</span>
                                <span className={styles.stepHint}>{stage.hint}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile Vertical Stepper (shown on mobile <= 768px) */}
                      <div className={styles.mobileStepper}>
                        <div className={styles.mobileProgressBarContainer}>
                          <div
                            className={styles.mobileProgressBarFill}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className={styles.mobileTimeline}>
                          {MILESTONE_STAGES.map((stage, idx) => {
                            const isDone = idx < activeIndex;
                            const isCurrent = idx === activeIndex;

                            return (
                              <div
                                key={stage.key}
                                className={`${styles.mobileStepItem} ${
                                  isDone
                                    ? styles.mobileStepDone
                                    : isCurrent
                                    ? styles.mobileStepCurrent
                                    : styles.mobileStepUpcoming
                                }`}
                              >
                                <div className={styles.mobileStepIndicator}>
                                  <div className={styles.mobileStepCircle}>
                                    {isDone ? (
                                      <Check size={12} strokeWidth={2.5} />
                                    ) : (
                                      <span>{stage.step}</span>
                                    )}
                                  </div>
                                  {idx < MILESTONE_STAGES.length - 1 && (
                                    <div className={styles.mobileStepLine} />
                                  )}
                                </div>

                                <div className={styles.mobileStepContent}>
                                  <div className={styles.mobileStepTitleRow}>
                                    <span className={styles.mobileStepTitle}>{stage.label}</span>
                                    {isCurrent && (
                                      <span className={styles.mobileActiveBadge}>Current</span>
                                    )}
                                  </div>
                                  <span className={styles.mobileStepHint}>{stage.hint}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Details Two-Column Grid */}
              <div className={styles.detailsGrid}>
                {/* Column 1: Client & Delivery Destination */}
                <div className={styles.detailsCard}>
                  <div className={styles.cardHeader}>
                    <User size={18} className={styles.cardHeaderIcon} />
                    <h3>Client Information</h3>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Client Name</span>
                      <strong className={styles.infoValue}>{enquiry.customerName}</strong>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Company / Studio</span>
                      <strong className={styles.infoValue}>
                        {enquiry.companyName || "Independent Client"}
                      </strong>
                    </div>

                    {enquiry.designation && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Designation</span>
                        <strong className={styles.infoValue}>{enquiry.designation}</strong>
                      </div>
                    )}

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>{enquiry.email}</span>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Phone / WhatsApp</span>
                      <span className={styles.infoValue}>{enquiry.phone}</span>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Delivery Destination</span>
                      <strong className={styles.infoValue}>
                        {enquiry.location}
                        {enquiry.country ? `, ${enquiry.country}` : ""}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Column 2: Project Specifications */}
                <div className={styles.detailsCard}>
                  <div className={styles.cardHeader}>
                    <Briefcase size={18} className={styles.cardHeaderIcon} />
                    <h3>Project Specifications</h3>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Expected Volume</span>
                      <strong className={styles.infoValue}>
                        {enquiry.expectedQuantity
                          ? `${enquiry.expectedQuantity} Units`
                          : "Custom Consultation"}
                      </strong>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Target Delivery Date</span>
                      <strong className={styles.infoValue}>
                        {enquiry.deliveryDate || "Flexible / In Discussion"}
                      </strong>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Customization Level</span>
                      <div className={styles.customBadgeRow}>
                        {enquiry.customizationRequired ? (
                          <span className={styles.customReqBadge}>
                            <Sparkles size={13} />
                            Bespoke Customization Required
                          </span>
                        ) : (
                          <span className={styles.standardBadge}>Standard Specifications</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Client Instructions / Notes</span>
                      <div className={styles.messageBox}>
                        <p>{enquiry.message || "No additional specifications noted."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className={styles.itemsCard}>
                <div className={styles.cardHeader}>
                  <Package size={18} className={styles.cardHeaderIcon} />
                  <h3>Enquired Products ({enquiry.items.length})</h3>
                </div>

                {enquiry.items.length === 0 ? (
                  <p className={styles.emptyItemsText}>
                    This enquiry was submitted as a general custom manufacturing request.
                  </p>
                ) : (
                  <>
                    {/* Desktop Items Table */}
                    <div className={styles.desktopTableWrapper}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th>Item Description</th>
                            <th>Product Code / SKU</th>
                            <th className={styles.textCenter}>Quantity</th>
                            <th className={styles.textRight}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiry.items.map((item: any) => (
                            <tr key={item.id}>
                              <td>
                                <strong className={styles.itemName}>
                                  {item.productNameSnapshot}
                                </strong>
                              </td>
                              <td>
                                <span className={styles.itemCode}>
                                  {item.productCodeSnapshot}
                                </span>
                              </td>
                              <td className={styles.textCenter}>
                                <span className={styles.qtyBadge}>{item.quantity} Units</span>
                              </td>
                              <td className={styles.textRight}>
                                <span className={styles.itemStatusText}>Included in Enquiry</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Items Cards */}
                    <div className={styles.mobileItemsList}>
                      {enquiry.items.map((item: any) => (
                        <div key={item.id} className={styles.mobileItemCard}>
                          <div className={styles.mobileItemTop}>
                            <strong className={styles.mobileItemName}>
                              {item.productNameSnapshot}
                            </strong>
                            <span className={styles.qtyBadge}>{item.quantity} Units</span>
                          </div>
                          <div className={styles.mobileItemCodeRow}>
                            <span className={styles.mobileItemCodeLabel}>SKU:</span>
                            <span className={styles.itemCode}>{item.productCodeSnapshot}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Concierge Support Card */}
              <div className={styles.conciergeCard}>
                <div className={styles.conciergeContent}>
                  <h3>Need Assistance or Want to Amend Requirements?</h3>
                  <p>
                    Our artisanal manufacturing studio in Jodhpur is at your service. For immediate
                    updates, design revisions, or shipping timelines, reach out directly to our
                    team.
                  </p>
                </div>
                <div className={styles.conciergeActions}>
                  <a
                    href={`mailto:uniquetimberhandicraftjodhpur@gmail.com?subject=Enquiry%20Update%20Request%3A%20${encodeURIComponent(
                      enquiry.enquiryNumber
                    )}`}
                    className={styles.conciergePrimaryBtn}
                  >
                    <Mail size={16} />
                    <span>Email Studio Concierge</span>
                  </a>
                  <Link href="/contact" className={styles.conciergeSecondaryBtn}>
                    <span>Contact Details</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
