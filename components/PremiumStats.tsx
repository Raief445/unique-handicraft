"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './PremiumStats.module.css';

interface StatItemProps {
  endValue: number;
  suffix: string;
  label: string;
  inView: boolean;
  prefersReducedMotion: boolean;
}

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const StatCard = ({ endValue, suffix, label, inView, prefersReducedMotion }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Prevent re-triggering if already animated
    if (!inView || hasAnimated) return;

    if (prefersReducedMotion) {
      setCount(endValue);
      setHasAnimated(true);
      return;
    }

    let startTime: number;
    let animationFrameId: number;
    const duration = 1500; // 1.5 seconds as requested
    
    const animate = (currentTime: number) => {
      if (startTime === undefined) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const currentCount = Math.floor(easeOutCubic(progress) * endValue);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        setHasAnimated(true);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [inView, endValue, prefersReducedMotion, hasAnimated]);

  return (
    <div className={styles.card}>
      <div className={styles.numberWrapper}>
        <span className={styles.number}>{count}</span>
        <span className={styles.suffix}>{suffix}</span>
      </div>
      <div className={styles.divider}></div>
      <p className={styles.label}>{label}</p>
    </div>
  );
};

export default function PremiumStats() {
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Safely check matchMedia on client
    if (typeof window !== 'undefined') {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Only trigger once per page load
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, []);

  const stats = [
    { endValue: 10, suffix: '+', label: 'Years of Experience' },
    { endValue: 25, suffix: '+', label: 'International Clients' },
    { endValue: 15, suffix: '+', label: 'Countries Served' },
    { endValue: 100, suffix: '+', label: 'Skilled Artisans' },
  ];

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${styles.cardWrapper} ${inView ? styles.inView : ''}`} 
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${index * 150}ms` }}
            >
              <StatCard 
                endValue={stat.endValue} 
                suffix={stat.suffix} 
                label={stat.label} 
                inView={inView}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
