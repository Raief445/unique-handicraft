import styles from "./custom.module.css";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Manufacturing | Unique Timber & Handicraft",
  description: "Unique Timber & Handicraft provides custom furniture manufacturing and B2B production based on client requirements. Handcrafted in Jodhpur, India.",
  alternates: {
    canonical: "/custom-manufacturing",
  },
};

const process = [
  { step: "01", title: "Share Your Requirement", desc: "Contact us with your design, dimensions, material preferences, finish requirements, or reference images." },
  { step: "02", title: "Discuss Design & Specifications", desc: "We review the requirement with you and discuss the specifications, feasibility, materials and finish options." },
  { step: "03", title: "Sample / Prototype", desc: "If required, a sample or prototype can be developed for review before moving into final production." },
  { step: "04", title: "Approval", desc: "Once the design or sample is approved, we confirm the specifications and proceed with the agreed production plan." },
  { step: "05", title: "Final Production", desc: "We manufacture the approved pieces according to the agreed specifications and quantities." },
  { step: "06", title: "Quality & Packaging", desc: "Finished pieces are checked for construction and finish, then packaged appropriately for dispatch." },
  { step: "07", title: "Dispatch", desc: "Products are dispatched according to the agreed timeline and delivery arrangements." },
];

export default function CustomManufacturingPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.eyebrow}>CUSTOM MANUFACTURING</div>
          <h1>Made around your requirements.</h1>
          <p>We manufacture furniture and handicraft products around your specific designs, dimensions and requirements.</p>
          <Link href="/contact" className={styles.heroCta}>REQUEST CUSTOM MANUFACTURING</Link>
        </div>
      </div>

      <div className="container">
        <section className={styles.intro}>
          <div className={styles.eyebrow}>CUSTOM MANUFACTURING</div>
          <h2>Custom Manufacturing</h2>
          <div className={styles.introContent}>
            <p>
              Have a specific design, dimension, drawing or reference that is not covered by our standard collection? We can discuss manufacturing the piece around your requirements.
            </p>
            <p>
              Our custom manufacturing process is flexible and collaborative. The stages below describe a typical workflow, while the actual process may vary depending on the nature and complexity of the project.
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
            Send us your requirement, reference images or design files. Our team will review the details and discuss the next steps with you.
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
