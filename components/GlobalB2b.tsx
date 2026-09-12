"use client";

import React from 'react';
import Link from 'next/link';
import styles from './GlobalB2b.module.css';
import ScrollReveal from './ScrollReveal';

export default function GlobalB2b() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.content}`}>
        <ScrollReveal direction="up">
          <span className={styles.subtitle}>International Export</span>
          <h2 className={styles.title}>Built for Global Partners</h2>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={150}>
          <p className={styles.description}>
            We specialize in fulfilling large-scale B2B orders for hospitality, retail, and commercial projects worldwide. With extensive experience in international shipping, customs documentation, and container optimization, we ensure your furniture arrives safely and on time.
          </p>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={300}>
          <div className={styles.actions}>
            <Link href="/contact" className="btn-secondary" style={{ borderColor: 'white', color: 'white' }}>
              Start an Enquiry
            </Link>
            <Link href="/custom-manufacturing" className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: 'none' }}>
              Custom Requirements
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
