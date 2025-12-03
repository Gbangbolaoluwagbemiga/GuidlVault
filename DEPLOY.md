# Deployment Guide for VaultGuard on Celo

## Prerequisites

1. **Private Key**: Your wallet's private key with CELO tokens for gas fees
2. **CeloScan API Key**: Get one at https://celoscan.io/apis (free)

## Setup

1. Create a `.env` file in the root directory:

```bash
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here
CELO_RPC_URL=https://forno.celo.org
```

2. Make sure you have CELO tokens in your wallet for gas fees (at least 0.1 CELO recommended)

## Deploy to Celo Mainnet

```bash
npm run deploy:celo:mainnet
```

## Deploy to Celo Alfajores (Testnet)

For testing first:

```bash
npm run deploy:celo:alfajores
```

## Manual Verification (if auto-verification fails)

After deployment, you can manually verify:

```bash
npx hardhat verify --network celo <CONTRACT_ADDRESS> <PLATFORM_WALLET_ADDRESS>
```

Example:

```bash
npx hardhat verify --network celo 0x1234...abcd 0x5678...efgh
```

## View on CeloScan

After deployment, view your contract at:

- Mainnet: https://celoscan.io/address/<CONTRACT_ADDRESS>
- Testnet: https://alfajores.celoscan.io/address/<CONTRACT_ADDRESS>


