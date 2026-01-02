import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tilt - Scroll Smarter, Not Harder",
  description:
    "An interactive learning platform for productive dopamine production. Doom scroll problems instead of social media.",
  keywords: ["learning", "problems", "education", "interactive", "study"],
  authors: [{ name: "Tilt" }],
  openGraph: {
    title: "Tilt - Scroll Smarter, Not Harder",
    description: "Doom scroll problems instead of social media.",
    type: "website",
    siteName: "Tilt",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tilt - Scroll Smarter, Not Harder",
    description: "Doom scroll problems instead of social media.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
