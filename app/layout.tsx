// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileNav } from "@/components/MobileNav";
import { DesktopNav } from "@/components/DesktopNav";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "My Life Dashboard",
  description: "Your personal cloud life dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dashboard",
    startupImage: [
      {
        url: "/icons/splash-2048x2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-1668x2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-1290x2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B9080",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="My Dashboard" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body bg-cream-50 text-forest-900 antialiased">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex min-h-screen">
          <DesktopNav />
          <main className="flex-1 ml-64 min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden min-h-screen">
          <main className="page-content">
            <div className="px-4 pt-4 animate-fade-in">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#2c3e35",
              border: "1px solid #ede6d3",
              borderRadius: "12px",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            },
            success: {
              iconTheme: { primary: "#6B9080", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
