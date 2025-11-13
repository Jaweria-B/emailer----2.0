import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { siteConfig, structuredData, organizationStructuredData } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  
  // Open Graph metadata for social sharing (LinkedIn, Facebook, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI Email Generator`,
      },
    ],
  },
  
  // Icons and favicon
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification tags (uncomment and add your code when you get it from Google Search Console)
  // verification: {
  //   google: 'ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE', 
  // },
  
  // Canonical URL
  alternates: {
    canonical: siteConfig.url,
  },
  
  // Additional metadata
  category: 'technology',
  classification: 'Business Software',
  
  // Theme color for browsers
  themeColor: '#4287f5',
  
  // Apple Web App settings
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Structured Data - Software Application (for Google rich results) */}
        <Script
          id="structured-data-software"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Structured Data - Organization (for Google Knowledge Graph) */}
        <Script
          id="structured-data-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        
        <AuthProvider>
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}