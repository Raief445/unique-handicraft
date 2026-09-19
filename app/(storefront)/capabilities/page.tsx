import styles from "./capabilities.module.css";
import Link from "next/link";

export const metadata = {
  title: "Our Capabilities | Unique Timber & Handicraft",
  description: "Explore the manufacturing capabilities of Unique Timber & Handicraft — furniture and handicraft manufacturer in Jodhpur.",
};

const capabilities = [
  {
    number: "01",
    title: "MATERIALS",
    description:
      "We work primarily with wood and furniture-grade materials selected according to the requirements of each project. Material options, availability and specifications can be discussed during the planning stage.",
  },
  {
    number: "02",
    title: "FINISHING",
    description:
      "Finishes can be developed around the required colour, tone and surface character. Options may include stains, paints and natural finishes, depending on the product and project specification.",
  },
  {
    number: "03",
    title: "CUSTOMIZATION",
    description:
      "Have your own design or specification? We can work from dimensions, technical details and reference designs to manufacture pieces around your requirements.",
  },
  {
    number: "04",
    title: "ORDER VOLUMES",
    description:
      "We work with different order quantities depending on the product and project. Quantities, specifications and production requirements are discussed individually before production begins.",
  },
  {
    number: "05",
    title: "QUALITY",
    description:
      "Quality is checked throughout production, with attention to construction, finish and the agreed specifications of each project.",
  },
  {
    number: "06",
    title: "PACKAGING",
    description:
      "Products are packaged with protection and handling in mind. Packaging requirements can be discussed for larger or export-oriented orders.",
  },
];

export default function CapabilitiesPage() {
  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.eyebrow}>MANUFACTURING CAPABILITIES</div>
          <h1>Manufacturing built around your requirements.</h1>
          <p className={styles.heroSubtext}>
            From material selection and finishing to customization, quality control and packaging, we work across the key stages of furniture manufacturing.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Introduction */}
        <section className={`${styles.section} ${styles.sectionIntro} ${styles.sectionConnectedBottom}`}>
          <div className={styles.introContent}>
            <p>
              Every project begins with a clear understanding of the product, its specifications and the requirements behind it. We work with customers to align materials, dimensions, finishes and quantities before production begins.
            </p>
            <p>
              This allows each project to move from initial requirement to production with greater clarity and consistency.
            </p>
          </div>
        </section>

        {/* Capability Sequence */}
        <section className={`${styles.section} ${styles.sectionSequence}`}>
          <div className={styles.verticalSequence}>
            {capabilities.map((cap, index) => (
              <div key={cap.title}>
                <div className={styles.sequenceItem}>
                  <div className={styles.sequenceLeft}>
                    <div className={styles.sequenceNumber}>{cap.number}</div>
                    <h2 className={styles.sequenceTitle}>{cap.title}</h2>
                  </div>
                  <div className={styles.sequenceRight}>
                    <p>{cap.description}</p>
                  </div>
                </div>
                {index < capabilities.length - 1 && <div className={styles.sequenceDivider} />}
              </div>
            ))}
          </div>
        </section>

        {/* Project Positioning */}
        <section className={`${styles.section} ${styles.sectionConnectedTop} ${styles.sectionConnectedBottom}`}>
          <div className={styles.centeredContent}>
            <div className={styles.eyebrow}>OUR APPROACH</div>
            <h2>Built around the details that matter.</h2>
            <p>
              Whether you are sourcing from our existing collection or developing a specific requirement, we work closely with customers to align product details, quantities, finishes and delivery requirements.
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className={`${styles.section} ${styles.ctaSection} ${styles.sectionConnectedTop}`}>
          <div className={styles.ctaContent}>
            <h2>Tell us what you're looking to manufacture.</h2>
            <p>
              Share your product requirements, quantities, dimensions and finish preferences. We'll review the details and discuss the next steps with you.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn-primary">
                DISCUSS YOUR REQUIREMENT
              </Link>
              <Link href="/custom-manufacturing" className="btn-secondary">
                CUSTOM MANUFACTURING
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
