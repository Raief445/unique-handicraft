import styles from "./custom.module.css";
import Link from "next/link";

export const metadata = {
  title: "Custom Manufacturing | Unique Timber & Handicraft",
  description: "Custom furniture and handicraft manufacturing. Share your design or requirements with Unique Timber & Handicraft, Jodhpur.",
};

const process = [
  { step: "01", title: "Share Your Requirement", desc: "Contact us with your design, dimensions, material preferences, or any reference images you have." },
  { step: "02", title: "Discuss Design & Specifications", desc: "Our team will review your requirement and discuss the specifications, feasibility, and available options." },
  { step: "03", title: "Sample / Prototype", desc: "If required, we can produce a sample or prototype for your approval before proceeding to final production." },
  { step: "04", title: "Approval", desc: "Once the sample or design is finalized, approval is provided before production begins." },
  { step: "05", title: "Final Production", desc: "We proceed with manufacturing according to the approved specifications and agreed quantities." },
  { step: "06", title: "Quality & Packaging", desc: "Products are checked for quality and prepared with appropriate packaging before dispatch." },
  { step: "07", title: "Dispatch", desc: "Products are dispatched according to the agreed timeline and delivery arrangements." },
];

export default function CustomManufacturingPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.eyebrow}>CUSTOM MANUFACTURING</div>
          <h1>Have Your Own Design or Requirement?</h1>
          <p>We manufacture furniture and handicraft products around your specific dimensions, designs and requirements.</p>
          <Link href="/contact" className={styles.heroCta}>REQUEST CUSTOM MANUFACTURING</Link>
        </div>
      </div>

      <div className="container">
        <section className={styles.intro}>
          <h2>Custom Manufacturing</h2>
          <div className={styles.introContent}>
            <p>
              If you have specific dimensions, a custom design, your own drawings, or requirements that are not covered by our standard collection, we can discuss manufacturing those pieces for you.
            </p>
            <p>
              Our process is flexible and collaborative. The steps below describe a typical custom manufacturing workflow, while the actual process may vary depending on the nature and complexity of the project.
            </p>
          </div>
        </section>

        <section className={styles.processSection}>
          <div className={styles.processHeader}>
            <h2>The Custom Manufacturing Process</h2>
          </div>
          <div className={styles.processSteps}>
            {process.map((step, index) => (
              <div key={step.step}>
                <div className={styles.processStep}>
                  <div className={styles.stepNumber}>{step.step}</div>
                  <div className={styles.stepContent}>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {index < process.length - 1 && <div className={styles.stepDivider} />}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.note}>
          <p>
            Please Note: The actual process, timeline and terms will depend on the nature of your requirement. The steps above are a general guide. Contact us to discuss your specific project.
          </p>
        </section>

        <section className={styles.ctaSection}>
          <h2>Ready to Discuss Your Requirement?</h2>
          <p>
            Send us your requirement, reference images, or design files. We'll review the details and discuss the next steps with you.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/contact" className="btn-primary">CONTACT US NOW</Link>
            <Link href="/products" className="btn-secondary">BROWSE STANDARD PRODUCTS</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
