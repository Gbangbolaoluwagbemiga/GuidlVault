const hre = require("hardhat");

async function main() {
  console.log("Deploying VaultGuard...");

  // Get deployer account
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "No signers available. Please set PRIVATE_KEY in .env file"
    );
  }
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // Deployment parameters
  // Platform wallet receives the 2.5% platform fee
  const platformWallet = deployer.address; // Change to dedicated platform wallet if desired

  // Deploy the contract
  const VaultGuard = await hre.ethers.getContractFactory("VaultGuard");
  const vaultGuard = await VaultGuard.deploy(platformWallet);

  await vaultGuard.waitForDeployment();
  const vaultGuardAddress = await vaultGuard.getAddress();

  console.log("\n✅ VaultGuard deployed successfully!");
  console.log("Contract address:", vaultGuardAddress);
  console.log("\nDeployment parameters:");
  console.log("- Platform Wallet:", platformWallet);
  console.log("- Platform Fee: 2.5% (250 basis points)");

  // Deploy ReputationSBT and wire it up
  console.log("\nDeploying ReputationSBT...");
  const ReputationSBT = await hre.ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy(platformWallet);
  await reputationSBT.waitForDeployment();
  const sbtAddress = await reputationSBT.getAddress();
  console.log("✅ ReputationSBT deployed:", sbtAddress);

  console.log("Setting SBT minter to VaultGuard and linking in VaultGuard...");
  await (await reputationSBT.connect(deployer).setMinter(vaultGuardAddress)).wait();
  await (await vaultGuard.connect(deployer).setReputationSBT(sbtAddress)).wait();
  console.log("✅ SBT integration complete");

  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await vaultGuard.deploymentTransaction().wait(5);
    await reputationSBT.deploymentTransaction().wait(5);
    console.log("✅ Contract confirmed on network:", hre.network.name);
  }

  // Verify contracts on block explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    try {
      console.log("\n🔍 Verifying contract on block explorer...");
      await hre.run("verify:verify", {
        address: vaultGuardAddress,
        constructorArguments: [platformWallet],
      });
      await hre.run("verify:verify", {
        address: sbtAddress,
        constructorArguments: [platformWallet],
      });
      console.log("✅ Contracts verified successfully!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("\n📝 Example: Create a vault with the following parameters:");
  console.log("  - Judges: [judge1, judge2, judge3]");
  console.log("  - Required Approvals: 2");
  console.log("  - Payouts: [100 (1%), 500 (5%), 2000 (20%), 5000 (50%)]");
  console.log("  - Initial Deposit: 10 CELO/native or cUSD ERC20 amount");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
