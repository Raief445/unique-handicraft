import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  title: "Unique Timber & Handicraft | Furniture & Handicrafts Jodhpur",
  description: "Jodhpur-based furniture and handicraft manufacturing since 2015, providing premium furniture and handicrafts.",
};

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body>
        <VisitorTracker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
