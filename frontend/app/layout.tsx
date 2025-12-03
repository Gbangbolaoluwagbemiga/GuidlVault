import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/lib/wagmi";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaultGuard - Decentralized Bug Bounty Platform",
  description: "Protocol-friendly, researcher-friendly bug bounty platform on Celo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

