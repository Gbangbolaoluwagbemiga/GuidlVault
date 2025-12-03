# VaultGuard 🔐

> **Decentralized bug bounty platform** - A protocol-friendly, researcher-friendly, and judge-based vulnerability reporting system built on Celo.

VaultGuard is a decentralized bug bounty platform where protocols create vaults with custom payout tiers, security researchers submit vulnerabilities, and trusted judges verify submissions through multisig voting. Built with Solidity for the Web3 ecosystem.

---

## ✨ Features

### Protocol-Friendly

- ✅ **Custom Payout Tiers** - Set LOW/MEDIUM/HIGH/CRITICAL payout percentages
- ✅ **Choose Your Judges** - Select trusted security firms, auditors, or community members
- ✅ **Multisig Voting** - Configurable approval threshold for submissions
- ✅ **Flexible Funding** - Deposit more funds anytime to your vault
- ✅ **Vault Management** - Close vault and withdraw remaining funds anytime

### Researcher-Friendly

- ✅ **IPFS Integration** - Submit vulnerability reports via IPFS hash (privacy-first)
- ✅ **Automatic Payout Calculation** - Based on severity and vault configuration
- ✅ **Low Platform Fee** - Only 2.5% platform fee (vs 10-20% on centralized platforms)
- ✅ **Trustless** - Can't be censored or denied unfairly
- ✅ **Transparent** - All submissions and payouts visible on-chain

### Judge System

- ✅ **Decentralized Verification** - Multisig voting by trusted judges
- ✅ **One Rejection = Denied** - Prevents bad reports from being approved
- ✅ **Threshold Approvals** - Automatic payout when threshold is met
- ✅ **Transparent Voting** - All votes recorded on-chain

### Security Features

- 🔒 **Funds Locked** - Funds locked in contract until approved
- 🔒 **Protocol Control** - Protocol can close vault and withdraw remaining funds
- 🔒 **Transparent History** - All submissions visible on-chain
- 🔒 **No Censorship** - Decentralized platform can't arbitrarily deny claims

---

## 📋 Contract Overview

### Severity Levels

- **LOW** - Minor issues (typically 1-10% of vault)
- **MEDIUM** - Moderate issues (typically 5-25% of vault)
- **HIGH** - Critical issues (typically 20-50% of vault)
- **CRITICAL** - Severe vulnerabilities (typically 50-100% of vault)

### Key Functions

#### Vault Management

- `createVault(judges, requiredApprovals, payouts)` - Create a new bug bounty vault
- `depositFunds(vaultId)` - Add more funds to an existing vault
- `closeVault(vaultId)` - Close vault and withdraw remaining funds

#### Submissions

- `submitVulnerability(vaultId, reportHash, severity)` - Submit a vulnerability report
- `voteOnSubmission(submissionId, approved)` - Judge votes on a submission
- `claimPayout(submissionId)` - Claim payout for approved submission

#### View Functions

- `getVaultJudges(vaultId)` - Get list of judges for a vault
- `getVaultSubmissions(vaultId)` - Get all submissions for a vault
- `getSubmissionDetails(submissionId)` - Get detailed submission information
- `getPayoutPercentage(vaultId, severity)` - Get payout percentage for severity level

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hardhat
- CELO tokens for gas fees (for deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Gbangbolaoluwagbemiga/GuidlVault.git
cd GuidlVault
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here
CELO_RPC_URL=https://forno.celo.org
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

#### Celo Mainnet

```bash
npm run deploy:celo:mainnet
```

#### Celo Alfajores (Testnet)

```bash
npm run deploy:celo:alfajores
```

---

## 📖 Usage Examples

### Creating a Vault

```solidity
// Example: Create a vault with 3 judges, requiring 2 approvals
address[] memory judges = [judge1, judge2, judge3];
uint256 requiredApprovals = 2;
uint256[4] memory payouts = [
    100,   // 1% for LOW
    500,   // 5% for MEDIUM
    2000,  // 20% for HIGH
    5000   // 50% for CRITICAL
];

vaultGuard.createVault(judges, requiredApprovals, payouts, {
    value: ethers.parseEther("10") // 10 CELO initial deposit
});
```

### Submitting a Vulnerability

```solidity
// Submit with IPFS hash of encrypted report
vaultGuard.submitVulnerability(
    vaultId,
    "QmYourIPFSHashHere",
    Severity.HIGH
);
```

### Voting on Submission

```solidity
// Judge approves submission
vaultGuard.voteOnSubmission(submissionId, true);

// Judge rejects submission (immediate rejection)
vaultGuard.voteOnSubmission(submissionId, false);
```

### Claiming Payout

```solidity
// Researcher claims approved payout
vaultGuard.claimPayout(submissionId);
```

---

## 🌐 Deployment

### Deployed Contract

**Celo Mainnet:**

- Contract Address: `0x7C1486c50A729DDbf5a812C490a075053522EE43`
- Explorer: https://celoscan.io/address/0x7C1486c50A729DDbf5a812C490a075053522EE43
- Platform Fee: 2.5% (250 basis points)

**Base Mainnet:**

- Contract Address: `0x9B1A83cE71a3AC986e5646E500b9257260Bd4D4b`
- Explorer: https://basescan.org/address/0x9B1A83cE71a3AC986e5646E500b9257260Bd4D4b#code
- Platform Fee: 2.5% (250 basis points)

### Network Information

| Network        | Chain ID | Explorer                                            | RPC URL                                  |
| -------------- | -------- | --------------------------------------------------- | ---------------------------------------- |
| Celo Mainnet   | 42220    | [CeloScan](https://celoscan.io)                     | https://forno.celo.org                   |
| Celo Alfajores | 44787    | [CeloScan Alfajores](https://alfajores.celoscan.io) | https://alfajores-forno.celo-testnet.org |
| Base Mainnet   | 8453     | [BaseScan](https://basescan.org)                    | https://mainnet.base.org                 |
| Base Sepolia   | 84532    | [BaseScan Sepolia](https://sepolia.basescan.org)    | https://sepolia.base.org                 |

---

## 🔐 Security Considerations

- ⚠️ **Never commit** your `.env` file or private keys
- ✅ All withdrawals require multisig approval
- ✅ One judge rejection = immediate denial
- ✅ Funds locked until approval
- ✅ Protocol can close vault anytime
- ✅ Transparent on-chain history

---

## 📁 Project Structure

```
GuidlVault/
├── contracts/
│   ├── VaultGuard.sol       # Main bug bounty contract
│   └── MockERC20.sol        # Mock token for testing
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   └── VaultGuard.test.js   # Test suite
├── hardhat.config.js        # Hardhat configuration
├── package.json
└── README.md
```

---

## 🎯 Hackathon Pitch Points

- **Real Problem**: HackerOne/Immunefi take huge cuts (10-20%) and can arbitrarily deny claims
- **Composable**: Other protocols can query past submissions for researcher reputation
- **Transparent**: All payouts/rejections visible on-chain
- **Demo-able**: Easy to show vault creation → submission → voting → payout flow
- **Low Fees**: Only 2.5% platform fee vs 10-20% on centralized platforms

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Celo** - For the carbon-negative blockchain
- **OpenZeppelin** - For secure, audited smart contract patterns
- **Hardhat** - For the amazing development environment

---

## 💡 Future Enhancements

- 📊 Analytics and reporting dashboard
- 🔄 Recurring vault funding
- 👥 Multi-vault management interface
- 🏷️ Tagging and categorization
- 📧 Event notifications
- 🔐 Integration with governance tokens
- ⚡ Gasless transactions (meta-transactions)
- 📱 Mobile app integration
- 🌍 Multi-language support

---

**Built with ❤️ for the Web3 security ecosystem**

_Decentralized, transparent, and fair bug bounty platform._ 🔐
