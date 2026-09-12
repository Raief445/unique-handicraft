"use client";

import React from 'react';
import styles from './WhyUniqueTimber.module.css';
import ScrollReveal from './ScrollReveal';

export default function WhyUniqueTimber() {
  const pillars = [
    {
      id: "01",
      title: "Craftsmanship",
      description: "Traditional woodworking combined with modern production capability, ensuring every piece meets rigorous structural standards."
    },
    {
      id: "02",
      title: "Custom Manufacturing",
      description: "Products developed precisely to buyer specifications. From blueprint to prototype to final production scale."
    },
    {
      id: "03",
      title: "Quality Control",
      description: "Dedicated quality checks at every stage of production—from timber seasoning to final finishing and dispatch."
    },
    {
      id: "04",
      title: "Export Ready",
      description: "Professional packaging and meticulous process management ensuring safe, efficient international container loading."
    }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <ScrollReveal direction="up" className={styles.header}>
          <h2 className={styles.title}>Why Us?</h2>
        </ScrollReveal>
        
        <div className={styles.grid}>
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.id} direction="up" delay={index * 150}>
              <div className={styles.card}>
                <span className={styles.number}>{pillar.id}</span>
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
                <p className={styles.description}>{pillar.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
