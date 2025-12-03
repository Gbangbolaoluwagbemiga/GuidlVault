# VaultGuard Frontend

A stunning, modern frontend for the VaultGuard decentralized bug bounty platform built with Next.js, Framer Motion, shadcn/ui, and Reown AppKit.

## Features

- 🎨 **Beautiful UI** - Modern design with glassmorphism effects and smooth animations
- 🎭 **Framer Motion** - Stunning animations and transitions throughout
- 🎯 **shadcn/ui** - Beautiful, accessible component library
- 🔌 **Reown AppKit** - Seamless wallet connection (WalletConnect)
- 📱 **Responsive** - Works perfectly on all devices
- 🌓 **Dark Mode** - Built-in theme support
- ⚡ **Fast** - Optimized with Next.js 15

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_REOWN_ID=your_reown_project_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Pages

- `/` - Landing page with hero, features, and CTA
- `/create` - Create a new bug bounty vault
- `/vaults` - Browse all active vaults
- `/submit` - Submit a vulnerability report

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **shadcn/ui** - UI components
- **Reown AppKit** - Wallet connection
- **Ethers.js** - Ethereum interaction
- **Sonner** - Toast notifications

## Contract Integration

The frontend connects to the VaultGuard contract deployed on Celo:

- **Address**: `0x7C1486c50A729DDbf5a812C490a075053522EE43`
- **Network**: Celo Mainnet (Chain ID: 42220)

## Project Structure

```
frontend/
├── app/              # Next.js app directory
│   ├── page.tsx      # Landing page
│   ├── create/       # Vault creation
│   ├── vaults/       # Vault listing
│   └── submit/       # Submission page
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── navbar.tsx   # Navigation
│   ├── hero.tsx     # Hero section
│   ├── features.tsx # Features section
│   └── ...
├── lib/             # Utilities
│   ├── contract.ts  # Contract ABI and address
│   ├── wagmi.tsx    # Reown AppKit setup
│   └── utils.ts     # Helper functions
└── styles/          # Global styles
```

## License

MIT


