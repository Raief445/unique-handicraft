import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { EnquiryCartProvider } from "@/components/EnquiryCartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import EnquiryCartDrawer from "@/components/EnquiryCartDrawer";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Unique Timber & Handicraft | Furniture & Handicrafts Jodhpur",
  description: "Jodhpur-based furniture and handicraft manufacturing since 2019, providing premium furniture and handicrafts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <EnquiryCartProvider>
            <Navbar categories={categories} />
            <EnquiryCartDrawer />
            <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
              {children}
            </main>
            <Footer />
          </EnquiryCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
