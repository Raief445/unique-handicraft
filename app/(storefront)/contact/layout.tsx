import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Unique Timber & Handicraft",
  description: "Get in touch with Unique Timber & Handicraft in Jodhpur. Contact us for product enquiries, wholesale orders, and custom furniture manufacturing.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
