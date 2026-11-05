"use client";

import { useState } from "react";
import { Copy, Check, Printer } from "lucide-react";
import styles from "./track.module.css";

export function CopyEnquiryButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy enquiry number", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={styles.copyBtn}
      title="Copy enquiry reference to clipboard"
      aria-label="Copy enquiry reference"
    >
      {copied ? (
        <>
          <Check size={14} className={styles.copyIconCheck} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={styles.printBtn}
      title="Print enquiry summary"
      aria-label="Print enquiry summary"
    >
      <Printer size={15} />
      <span>Print Summary</span>
    </button>
  );
}
