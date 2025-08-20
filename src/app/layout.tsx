import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavbarWrapper from "@/components/NavbarWrapper";
import PWAInstall from "@/components/PWAInstall";
import LoadingScreen from "@/components/LoadingScreen";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster as HotToaster } from "react-hot-toast"
import ServiceWorkerRegistration from "@/lib/ServiceWorkerRegistration";
import { TokenBalanceProvider } from "@/contexts/TokenBalanceContext";
import ScrollPositionProvider from "@/components/ScrollPositionProvider";
import { GlobalPullToRefresh } from "@/components/GlobalPullToRefresh";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ming HQ | Peer-to-peer escrow for people.",
  description: "Peer-to-peer escrow for people. Powered by Ming.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "P2P Trade",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        <LoadingScreen />
        <ScrollPositionProvider />
        <AuthProvider>
          <TokenBalanceProvider>
            <GlobalPullToRefresh>
              <div className="min-h-screen flex flex-col">
                {/* Development Banner */}
                <div className="bg-blue-500 border-b border-gray-800 text-white px-4 py-2 text-center font-medium shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-pulse">
                      🚧
                    </div>
                    <span className="text-sm md:text-base">
                      We're under development. App may crash, we'll fix it soon.
                    </span>
                    <div className="animate-pulse">
                      🚧
                    </div>
                  </div>
                </div>
                
                <NavbarWrapper />
                <main className="flex-1 mobile-safe-bottom md:pb-0">
                  {children}
                </main>
              </div>
            </GlobalPullToRefresh>
          </TokenBalanceProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
        <HotToaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              style: {
                background: '#065f46',
                color: '#ffffff',
                border: '1px solid #047857',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#7f1d1d',
                color: '#ffffff',
                border: '1px solid #991b1b',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <PWAInstall />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ER3MXWXLXD"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ER3MXWXLXD');
          `,
          }}
        />
      </body>
    </html >
  );
}
