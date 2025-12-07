import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/lib/wagmi";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaultGuard - Decentralized Bug Bounty Platform",
  description:
    "Protocol-friendly, researcher-friendly bug bounty platform on Celo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} transition-colors duration-500`}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}


