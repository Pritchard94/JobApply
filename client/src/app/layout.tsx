import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { NotificationModal } from "@/components/notification-modal";

export const metadata: Metadata = {
  title: "AutoApply - Automated Job Applications",
  description:
    "AI-powered platform that finds matching jobs and applies on your behalf. Upload your CV, set preferences, and let AutoApply do the rest.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1729",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          {children}
          <NotificationModal />
        </AuthProvider>
      </body>
    </html>
  );
}
