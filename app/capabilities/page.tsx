import styles from "./capabilities.module.css";
import Link from "next/link";
import { TreePine, Paintbrush, PencilRuler, Package, ShieldCheck, Mailbox } from "lucide-react";

export const metadata = {
  title: "Our Capabilities | Unique Timber & Handicraft",
  description: "Explore the manufacturing capabilities of Unique Timber & Handicraft — furniture and handicraft manufacturer in Jodhpur.",
};

const capabilities = [
  {
    icon: <TreePine size={32} strokeWidth={1} />,
    title: "Materials",
    description:
      "We work with wood and related materials suitable for furniture manufacturing. Specific material availability can be discussed based on your requirements.",
  },
  {
    icon: <Paintbrush size={32} strokeWidth={1} />,
    title: "Finishing",
    description:
      "Our products can be finished in a variety of styles. We can discuss finishing options — including stains, paints, and natural finishes — based on what you need.",
  },
  {
    icon: <PencilRuler size={32} strokeWidth={1} />,
    title: "Customization",
    description:
      "We welcome custom requirements. If you have your own design, dimensions, or specifications, our team can work with you to manufacture accordingly.",
  },
  {
    icon: <Package size={32} strokeWidth={1} />,
    title: "Order Volumes",
    description:
      "Our manufacturing setup is flexible to accommodate varying order volumes. We can discuss your requirements and work out a suitable arrangement for your project size.",
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1} />,
    title: "Quality",
    description:
      "Quality is checked during production. We focus on delivering products that meet the highest standards — because our customers depend on what they receive.",
  },
  {
    icon: <Mailbox size={32} strokeWidth={1} />,
    title: "Packaging",
    description:
      "Products are packaged to ensure they arrive in good condition. Custom packaging requirements can be discussed for larger or export orders.",
  },
];

export default function CapabilitiesPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1>Our Capabilities</h1>
          <p>What we can do for you</p>
        </div>
      </div>

      <div className="container">
        <section className={styles.intro}>
          <p>
            Unique Timber & Handicraft manufactures furniture and handicraft products in
            Jodhpur, Rajasthan. The following provides a general overview of our capabilities.
            For specific requirements, we encourage you to send us an enquiry so our team can
            discuss your needs in detail.
          </p>
        </section>

        <section className={styles.capabilitiesGrid}>
          {capabilities.map((cap) => (
            <div key={cap.title} className={styles.capCard}>
              <div className={styles.capIcon}>{cap.icon}</div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </section>

        <section className={styles.ctaSection}>
          <h2>Have a Specific Requirement?</h2>
          <p>
            The best way to understand if we can meet your requirements is to start an
            enquiry. Share your product needs, quantities, and any customization requirements,
            and our team will respond.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/custom-manufacturing" className="btn-primary">
              Custom Manufacturing
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
