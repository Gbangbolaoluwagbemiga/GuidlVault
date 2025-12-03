"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, celo, celoAlfajores } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_REOWN_ID || "1db88bda17adf26df9ab7799871788c4";

// Create a metadata object - this is optional
const metadata = {
  name: "VaultGuard",
  description: "Decentralized Bug Bounty Platform",
  url: "https://vaultguard.xyz", // origin must match your domain & subdomain
  icons: ["https://vaultguard.xyz/logo.png"],
};

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [celo, celoAlfajores, mainnet],
  projectId,
});

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, celoAlfajores, mainnet],
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  themeMode: "light",
});

export const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

