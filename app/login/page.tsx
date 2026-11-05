"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Invalid credentials or you do not have administrator access.");
      } else {
        router.push("/admin");
      }
    } catch {
      setLoading(false);
      setError("An unexpected network error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <ShieldCheck size={24} />
          </div>
          <h1>Unique Timber</h1>
          <span className={styles.brandBadge}>Executive Admin Portal</span>
        </div>

        <div className={styles.headerSection}>
          <h2>Sign In</h2>
          <p>Enter your administrator credentials to access the console</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="admin-email">Administrator Email</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Mail size={16} />
              </span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@uniquetimber.com"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="admin-password">Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Lock size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <a href="https://uniquehandicrafts.in" className={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Return to Storefront</span>
        </a>
      </div>
    </div>
  );
}
