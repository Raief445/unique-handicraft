import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://uniquehandicrafts.in"),
  title: {
    default: "Unique Timber & Handicraft | Furniture & Handicrafts Jodhpur",
    template: "%s | Unique Timber & Handicraft",
  },
  description: "Jodhpur-based furniture and handicraft manufacturing since 2015. Providing premium handcrafted furniture, wholesale supply, and custom manufacturing.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Unique Timber & Handicraft | Furniture & Handicrafts Jodhpur",
    description: "Jodhpur-based furniture and handicraft manufacturing since 2015. Premium handcrafted furniture, wholesale supply, and custom manufacturing.",
    url: "https://uniquehandicrafts.in",
    siteName: "Unique Timber & Handicraft",
    images: [
      {
        url: "https://i.postimg.cc/Vs46MpNq/logo.png",
        width: 1200,
        height: 630,
        alt: "Unique Timber & Handicraft",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unique Timber & Handicraft",
    description: "Jodhpur-based premium handcrafted furniture and wholesale supply.",
    images: ["https://i.postimg.cc/Vs46MpNq/logo.png"],
  },
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
      <head>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NHKSZNVD');
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NHKSZNVD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <VisitorTracker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
