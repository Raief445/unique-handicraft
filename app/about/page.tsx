import styles from "./about.module.css";
import Link from "next/link";

export const metadata = {
  title: "About Us | Unique Timber & Handicraft",
  description: "Learn about Unique Timber & Handicraft, a Jodhpur-based handicraft and furniture manufacturer working since 2015.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1>About Unique Timber & Handicraft</h1>
          <p>Jodhpur, Rajasthan, India · Working Since 2015</p>
        </div>
      </div>

      <div className="container">
        {/* Story */}
        <section className={styles.section}>
          <div className={styles.twoCol}>
            <div className={styles.textContent}>
              <h2>Our Story</h2>
              <p>
                Unique Timber & Handicraft was established in 2015 in Jodhpur, Rajasthan — a city
                historically renowned for its exceptional woodcraft and artisanal traditions.
              </p>
              <p>
                Our company was founded with a clear purpose: to bring the quality of
                Jodhpur's handcrafted furniture and decor to homes and spaces
                across India and beyond.
              </p>
              <p>
                We work directly with skilled craftsmen to produce beautiful furniture and handicraft
                items that meet the highest expectations of quality and design.
              </p>
            </div>
            <div className={styles.highlightBox}>
              <div className={styles.stat}>
                <strong>2015</strong>
                <span>Established</span>
              </div>
              <div className={styles.stat}>
                <strong>Jodhpur</strong>
                <span>Rajasthan, India</span>
              </div>
              <div className={styles.stat}>
                <strong>Premium</strong>
                <span>Quality</span>
              </div>
              <div className={styles.stat}>
                <strong>Handcrafted</strong>
                <span>Furniture</span>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className={styles.section}>
          <h2>Our Approach</h2>
          <div className={styles.threeCol}>
            <div className={styles.featureCard}>
              <h3>Manufacturing Excellence</h3>
              <p>
                We control the manufacturing process from start to finish. Our focus is on the production of high-quality
                furniture and handicraft items built to last.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Handcrafted Quality</h3>
              <p>
                Each product is crafted by skilled artisans with attention to detail. The
                handcrafted nature of our products gives them a unique character that machine production
                cannot replicate.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Dedicated Support</h3>
              <p>
                We work closely with our customers to ensure complete satisfaction. From initial enquiry
                to final delivery, we are committed to providing an exceptional experience.
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className={styles.section}>
          <h2>What We Make</h2>
          <p className={styles.sectionSubtext}>
            Our current product range includes furniture and handicraft items manufactured
            in Jodhpur. We continuously work on expanding our catalogue.
          </p>
          <div className={styles.productList}>
            {[
              "Coffee Tables",
              "Side Tables",
              "Round Tables",
              "Trunks",
              "Sideboards",
              "...and more!",
            ].map((product) => (
              <div key={product} className={styles.productTag}>
                {product}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/products" className="btn-primary">View Our Products</Link>
          </div>
        </section>

        {/* CTA */}
        <section className={`${styles.section} ${styles.cta}`}>
          <h2>Ready to Start an Enquiry?</h2>
          <p>Browse our catalogue, select your favorite products, and send us an enquiry.</p>
          <div className={styles.ctaActions}>
            <Link href="/products" className="btn-primary">Explore Products</Link>
            <Link href="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
