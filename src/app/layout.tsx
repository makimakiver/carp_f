import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DAppKitClientProvider } from "./DAppKitClientProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nexus | High-Performance Decentralized Trading",
  description:
    "Experience institutional-grade perpetual futures on a fully decentralized exchange with zero gas fees and lightning-fast execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <DAppKitClientProvider>{children}</DAppKitClientProvider>
      </body>
    </html>
  );
}
