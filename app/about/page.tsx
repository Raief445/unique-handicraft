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
          <div className={styles.eyebrow}>ABOUT UNIQUE TIMBER & HANDICRAFT</div>
          <h1>Rooted in Jodhpur.<br />Made for the world.</h1>
          <div className={styles.heroFacts}>
            <p>Jodhpur, Rajasthan, India</p>
            <span className={styles.dot}>&middot;</span>
            <p>Working Since 2015</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Story */}
        <section className={`${styles.section} ${styles.sectionConnectedBottom}`}>
          <div className={styles.editorialGrid}>
            <div className={styles.editorialHeadline}>
              <div className={styles.eyebrow}>OUR STORY</div>
              <h2>Furniture shaped by material, craft and place.</h2>
            </div>
            <div className={styles.editorialContent}>
              <div className={styles.narrowText}>
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
              <div className={styles.editorialStats}>
                <div className={styles.statItem}>
                  <strong>2015</strong>
                  <span>Established</span>
                </div>
                <div className={styles.statItem}>
                  <strong>Jodhpur</strong>
                  <span>Rajasthan, India</span>
                </div>
                <div className={styles.statItem}>
                  <strong>Premium</strong>
                  <span>Quality</span>
                </div>
                <div className={styles.statItem}>
                  <strong>Handcrafted</strong>
                  <span>Furniture</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Crafted in Jodhpur */}
        <section className={`${styles.section} ${styles.sectionConnectedTop}`}>
          <div className={styles.editorialGrid}>
            <div className={styles.editorialHeadline}>
              <div className={styles.eyebrow}>CRAFTED IN JODHPUR</div>
              <h2>Made where craftsmanship is part of the place.</h2>
            </div>
            <div className={styles.editorialContent}>
              <div className={styles.narrowText}>
                <p>
                  Our manufacturing process is deeply connected to Jodhpur. We embrace the 
                  established woodcraft and artisanal traditions of the city, working with 
                  skilled craftsmen to create handcrafted furniture.
                </p>
                <p>
                  Every piece reflects a material-led making approach, blending traditional 
                  workmanship with contemporary requirements to deliver lasting quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className={`${styles.section} ${styles.sectionConnectedBottom}`}>
          <div className={styles.editorialHeadlineCentered}>
            <div className={styles.eyebrow}>OUR APPROACH</div>
          </div>
          <div className={styles.verticalSequence}>
            <div className={styles.sequenceItem}>
              <div className={styles.sequenceNumber}>01</div>
              <div className={styles.sequenceContent}>
                <h3>Manufacturing Excellence</h3>
                <p>
                  We control the manufacturing process from start to finish. Our focus is on the production of high-quality
                  furniture and handicraft items built to last.
                </p>
              </div>
            </div>
            <div className={styles.sequenceDivider} />
            <div className={styles.sequenceItem}>
              <div className={styles.sequenceNumber}>02</div>
              <div className={styles.sequenceContent}>
                <h3>Handcrafted Quality</h3>
                <p>
                  Each product is crafted by skilled artisans with attention to detail. The
                  handcrafted nature of our products gives them a unique character that machine production
                  cannot replicate.
                </p>
              </div>
            </div>
            <div className={styles.sequenceDivider} />
            <div className={styles.sequenceItem}>
              <div className={styles.sequenceNumber}>03</div>
              <div className={styles.sequenceContent}>
                <h3>Dedicated Support</h3>
                <p>
                  We work closely with our customers to ensure complete satisfaction. From initial enquiry
                  to final delivery, we are committed to providing an exceptional experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Make */}
        <section className={`${styles.section} ${styles.sectionConnectedTop}`}>
          <div className={styles.editorialHeadlineCentered}>
            <h2>What We Make</h2>
            <p className={styles.sectionSubtextCentered}>
              Our current product range includes furniture and handicraft items manufactured
              in Jodhpur. We continuously work on expanding our catalogue.
            </p>
          </div>
          <div className={styles.editorialList}>
            {[
              { name: "Coffee Tables", link: "/products" },
              { name: "Side Tables", link: "/products" },
              { name: "Round Tables", link: "/products" },
              { name: "Trunks", link: "/products" },
              { name: "Sideboards", link: "/products" },
              { name: "Stools", link: "/products" },
              { name: "Mirror Frames", link: "/products" },
            ].map((category) => (
              <Link key={category.name} href={category.link} className={styles.listItem}>
                <span>{category.name}</span>
                <span className={styles.listArrow}>&rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className={`${styles.section} ${styles.ctaSection}`}>
          <div className={styles.ctaContent}>
            <h2>Let's build something together.</h2>
            <p>For collections, custom requirements and commercial projects, tell us what you're looking to create.</p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn-primary">DISCUSS YOUR REQUIREMENT</Link>
              <Link href="/products" className="btn-secondary">VIEW THE COLLECTION</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
