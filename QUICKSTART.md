# 🚀 VaultGuard - Quick Start Guide

## Overview

VaultGuard is a decentralized bug bounty platform featuring:
- **Protocol-friendly**: Custom payout tiers and judge selection
- **Researcher-friendly**: Transparent, automatic payouts (2.5% fee)
- **Judge-based verification**: Multisig voting system

## 📋 Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Basic understanding of Web3/Ethereum

## 🏃 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Gbangbolaoluwagbemiga/GuidlVault.git
cd GuidlVault
```

### 2. Install Dependencies

**For the entire project:**
```bash
npm install
```

**For frontend only:**
```bash
cd frontend
pnpm install
# or
npm install
```

### 3. Configure Environment (Optional)

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

Get your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

### 4. Start the Development Server

```bash
# From the frontend directory
pnpm dev
# or
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🌐 Network Configuration

### Celo Mainnet
- **Contract Address**: `0x7C1486c50A729DDbf5a812C490a075053522EE43`
- **Explorer**: https://celoscan.io/address/0x7C1486c50A729DDbf5a812C490a075053522EE43
- **RPC URL**: https://forno.celo.org

### Base Mainnet
- **Contract Address**: `0x9B1A83cE71a3AC986e5646E500b9257260Bd4D4b`
- **Explorer**: https://basescan.org/address/0x9B1A83cE71a3AC986e5646E500b9257260Bd4D4b
- **RPC URL**: https://mainnet.base.org

## 🎮 User Flows

### For Protocol Owners

1. **Connect Wallet** (top right)
2. Navigate to **Create Vault**
3. Fill in the form:
   - Initial deposit (CELO)
   - Add judge addresses
   - Set required approvals
   - Configure payout percentages
4. **Submit transaction**
5. Wait for confirmation
6. Your vault is now live!

### For Security Researchers

1. **Connect Wallet**
2. Browse **Vaults** to find active bounties
3. Navigate to **Submit**
4. Select a vault
5. Enter IPFS hash of your report
6. Select severity level
7. **Submit transaction**
8. Track your submission in the **Dashboard**
9. **Claim payout** once approved

### For Judges

1. **Connect Wallet**
2. Navigate to **Judge Portal**
3. Review pending submissions
4. Read vulnerability reports (via IPFS hash)
5. Vote to **Approve** or **Reject**
6. Transaction confirms your vote

## 📁 Project Structure

```
GuidlVault/
├── contracts/              # Solidity smart contracts
│   └── VaultGuard.sol     # Main contract
├── frontend/              # Next.js frontend
│   ├── app/              # Pages (Next.js 15 App Router)
│   ├── components/       # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and config
│   └── public/          # Static assets
├── scripts/             # Deployment scripts
├── test/               # Contract tests
└── hardhat.config.js   # Hardhat configuration
```

## 🛠️ Development Commands

### Frontend

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Celo Mainnet
npm run deploy:celo:mainnet

# Deploy to Celo Alfajores (Testnet)
npm run deploy:celo:alfajores
```

## 🎨 Key Features

### ✨ Modern UI
- Glassmorphism design
- Dark mode support
- Smooth animations
- Responsive layout

### 🔐 Security
- Type-safe contract interactions
- Form validation
- Error boundaries
- Transaction confirmations

### 🚀 Performance
- Code splitting
- Optimized bundle size
- Skeleton loading screens
- Efficient re-renders

## 📚 Tech Stack

### Frontend
- **Framework**: Next.js 15
- **UI**: React 19, TailwindCSS
- **Web3**: Wagmi, Viem, Ethers.js
- **Animations**: Framer Motion
- **Components**: Radix UI, shadcn/ui

### Smart Contracts
- **Language**: Solidity
- **Framework**: Hardhat
- **Testing**: Chai, Hardhat Network Helpers

## 🔧 Customization

### Update Contract Address

Edit `frontend/lib/contract.ts`:

```typescript
export const VAULT_GUARD_ADDRESS = "0xYourNewAddress";
```

### Change Theme Colors

Edit `frontend/app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... other colors */
}
```

### Add Custom Network

Edit `frontend/lib/wagmi.tsx`:

```typescript
const config = createAppKit({
  // ... existing config
  networks: [celo, base, yourCustomNetwork],
  // ...
});
```

## 🐛 Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask is installed
- Check you're on the correct network (Celo or Base)
- Try disconnecting and reconnecting

### Transaction Failures
- Check you have enough CELO/ETH for gas
- Verify contract addresses are correct
- Check network connection

### Build Errors
- Delete `node_modules` and reinstall
- Clear Next.js cache: `rm -rf .next`
- Verify Node.js version (v20+)

## 📖 Additional Resources

### Documentation
- [Frontend README](./frontend/README.md)
- [Refactor Summary](./FRONTEND_REFACTOR_SUMMARY.md)
- [Deployment Guide](./DEPLOY.md)

### Links
- **GitHub**: https://github.com/Gbangbolaoluwagbemiga/GuidlVault
- **Celo Contract**: https://celoscan.io/address/0x7C1486c50A729DDbf5a812C490a075053522EE43
- **Base Contract**: https://basescan.org/address/0x9B1A83cE71a3AC986e5646E500b9257260Bd4D4b

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Gbangbolaoluwagbemiga/GuidlVault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Gbangbolaoluwagbemiga/GuidlVault/discussions)

---

**Happy Hacking! 🎉**

Built with ❤️ for the Web3 security ecosystem

