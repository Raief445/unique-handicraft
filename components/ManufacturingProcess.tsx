"use client";

import React from 'react';
import styles from './ManufacturingProcess.module.css';
import ScrollReveal from './ScrollReveal';

export default function ManufacturingProcess() {
  const steps = [
    { num: "01", title: "Design" },
    { num: "02", title: "Material" },
    { num: "03", title: "Craft" },
    { num: "04", title: "Finish" },
    { num: "05", title: "Quality" },
    { num: "06", title: "Dispatch" }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <ScrollReveal direction="up" className={styles.header}>
          <h2 className={styles.title}>Manufacturing Process</h2>
        </ScrollReveal>
        
        <div className={styles.processContainer}>
          {steps.map((step, index) => (
            <ScrollReveal key={step.num} direction="up" delay={index * 100} className={styles.step}>
              <div className={styles.dot}>
                <div className={styles.dotInner}></div>
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepNumber}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
