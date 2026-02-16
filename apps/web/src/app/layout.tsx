import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RubbishReview — We only accept rubbish",
    template: "%s | RubbishReview",
  },
  description: "An open peer-review platform for academic failures, negative results, and spectacularly useless research. We only accept rubbish.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rubbishreview.org"),
  icons: {
    icon: "/og-icon.png",
    apple: "/og-icon.png",
  },
  openGraph: {
    siteName: "RubbishReview",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 675,
        alt: "RubbishReview — We only accept rubbish",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RubbishReview — We only accept rubbish",
    description: "An open peer-review platform for academic failures, negative results, and spectacularly useless research.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </body>
    </html>
  );
}
