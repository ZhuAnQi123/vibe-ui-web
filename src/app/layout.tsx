import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vibe UI",
  description:
    "Copy and paste highly-structured aesthetic instructions for Cursor, Windsurf, and Claude.",
  icons: {
    icon: [
      { url: "/vibeUI.svg", type: "image/svg+xml" },
      { url: "/vibeUI.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/vibeUI.png",
    apple: "/vibeUI.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
