const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultGuard Yield Features", function () {
    let VaultGuard, vaultGuard;
    let MockERC20, token;
    let MockYieldStrategy, strategy;
    let owner, protocol, researcher, judge, platform;
    const SEVERITY = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

    beforeEach(async function () {
        [owner, protocol, researcher, judge, platform] = await ethers.getSigners();

        // Deploy Token
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        token = await MockERC20Factory.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
        await token.waitForDeployment(); // Updated for specialized Hardhat Ethers response

        // Deploy VaultGuard
        const VaultGuardFactory = await ethers.getContractFactory("VaultGuard");
        vaultGuard = await VaultGuardFactory.deploy(platform.address);
        await vaultGuard.waitForDeployment();

        // Deploy Strategy
        const MockYieldStrategyFactory = await ethers.getContractFactory("MockYieldStrategy");
        strategy = await MockYieldStrategyFactory.deploy(await token.getAddress());
        await strategy.waitForDeployment();

        // Mint tokens to protocol
        await token.mint(protocol.address, ethers.parseEther("1000"));
        await token.connect(protocol).approve(await vaultGuard.getAddress(), ethers.parseEther("1000"));
    });

    it("Should deposit funds into strategy when set", async function () {
        // Create Vault
        const judges = [judge.address];
        const payouts = [100, 500, 2000, 5000];
        const initialDeposit = ethers.parseEther("100");

        await vaultGuard.connect(protocol).createERC20Vault(
            await token.getAddress(),
            judges,
            1,
            payouts,
            initialDeposit
        );
        // Vault ID 0 created

        // Set Strategy
        await vaultGuard.connect(protocol).setYieldStrategy(0, await strategy.getAddress());

        // Check strategy balance
        const strategyBalance = await strategy.balanceOf(await vaultGuard.getAddress());
        expect(strategyBalance).to.equal(initialDeposit);
    });

    it("Should withdraw from strategy when paying out", async function () {
        // 1. Setup Vault & Strategy
        const judges = [judge.address];
        const payouts = [1000, 2000, 3000, 5000]; // 10% for LOW
        const initialDeposit = ethers.parseEther("100");

        await vaultGuard.connect(protocol).createERC20Vault(await token.getAddress(), judges, 1, payouts, initialDeposit);
        await vaultGuard.connect(protocol).setYieldStrategy(0, await strategy.getAddress());

        // 2. Submit Vulnerability
        const tx = await vaultGuard.connect(researcher).submitVulnerability(0, "QmHash", SEVERITY.LOW);
        const receipt = await tx.wait();

        // 3. Judge Approves
        await vaultGuard.connect(judge).voteOnSubmission(0, true);

        // 4. Researcher Claims (Should trigger withdrawal from strategy)
        // Payout is 10% = 10 Tokens. Initial in strategy = 100. Remaining in strategy should be 90.
        await vaultGuard.connect(researcher).claimPayout(0);

        const strategyBalance = await strategy.balanceOf(await vaultGuard.getAddress());
        expect(strategyBalance).to.equal(ethers.parseEther("90"));

        const researcherBalance = await token.balanceOf(researcher.address);
        // 97.5% of 10 tokens = 9.75 tokens
        expect(researcherBalance).to.equal(ethers.parseEther("9.75"));
    });

    it("Should fail to set strategy for incompatible token", async function () {
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        const otherToken = await MockERC20Factory.deploy("Other", "OTR", ethers.parseEther("1000000"));
        await otherToken.waitForDeployment();

        const MockYieldStrategyFactory = await ethers.getContractFactory("MockYieldStrategy");
        const badStrategy = await MockYieldStrategyFactory.deploy(await otherToken.getAddress());
        await badStrategy.waitForDeployment();

        const judges = [judge.address];
        const payouts = [100, 500, 2000, 5000];

        await vaultGuard.connect(protocol).createERC20Vault(await token.getAddress(), judges, 1, payouts, ethers.parseEther("10"));

        await expect(
            vaultGuard.connect(protocol).setYieldStrategy(0, await badStrategy.getAddress())
        ).to.be.revertedWith("Invalid strategy asset");
    });
});
