import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSA Visualizer - Interactive Algorithm Learning",
  description: "Master Data Structures & Algorithms with interactive visualizations, step-by-step animations, and code examples in multiple languages.",
  keywords: ["DSA", "Algorithms", "Data Structures", "Visualization", "Learning", "Computer Science", "Programming"],
  authors: [{ name: "DSA Visualizer Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DSA Visualizer",
    description: "Interactive algorithm learning platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSA Visualizer",
    description: "Interactive algorithm learning platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
