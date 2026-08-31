import styles from "./custom.module.css";
import Link from "next/link";

export const metadata = {
  title: "Custom Manufacturing | Unique Timber & Handicraft",
  description: "Custom furniture and handicraft manufacturing. Share your design or requirements with Unique Timber & Handicraft, Jodhpur.",
};

const process = [
  { step: "01", title: "Share Your Requirement", desc: "Contact us with your design, dimensions, material preferences, or any reference images you have." },
  { step: "02", title: "Discuss Design & Specifications", desc: "Our team will review your requirement and discuss the specifications, feasibility, and options available." },
  { step: "03", title: "Sample / Prototype", desc: "If required, we can produce a sample or prototype for your approval before proceeding to final production." },
  { step: "04", title: "Approval", desc: "Once you are satisfied with the sample or design, you provide approval to proceed." },
  { step: "05", title: "Final Production", desc: "We proceed with manufacturing as per your approved specifications and agreed quantities." },
  { step: "06", title: "Quality & Packaging", desc: "Products are quality checked and packaged to ensure they are ready for dispatch." },
  { step: "07", title: "Dispatch", desc: "Products are dispatched as per the agreed timeline and delivery arrangements." },
];

export default function CustomManufacturingPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1>Have Your Own Design or Requirement?</h1>
          <p>We manufacture furniture and handicraft products as per your specific needs</p>
          <Link href="/contact" className={styles.heroCta}>Request Custom Manufacturing</Link>
        </div>
      </div>

      <div className="container">
        <section className={styles.intro}>
          <h2>Custom Manufacturing</h2>
          <p>
            If you have specific dimensions, a custom design, your own drawings, or unique
            requirements that are not covered by our standard catalogue, we can discuss
            manufacturing those products for you.
          </p>
          <p>
            Our process is flexible and collaborative. The steps below describe a typical
            custom manufacturing workflow — though the actual process may vary depending
            on the nature and complexity of your project.
          </p>
        </section>

        <section className={styles.processSection}>
          <h2 className="text-center mb-4">The Custom Manufacturing Process</h2>
          <div className={styles.processSteps}>
            {process.map((step, index) => (
              <div key={step.step} className={styles.processStep}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                {index < process.length - 1 && <div className={styles.connector} />}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.note}>
          <p>
            <strong>Please Note:</strong> The actual process, timeline, and terms will depend
            on the nature of your requirement. The above steps are a general guide. Contact
            us to discuss your specific project.
          </p>
        </section>

        <section className={styles.ctaSection}>
          <h2>Ready to Discuss Your Requirement?</h2>
          <p>
            Send us your requirement, reference images, or any design files. Our team will
            review and get back to you.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/contact" className="btn-primary">Contact Us Now</Link>
            <Link href="/products" className="btn-secondary">Browse Standard Products</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
