const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultGuard", function () {
  let vaultGuard;
  let platformWallet;
  let protocol;
  let researcher1;
  let researcher2;
  let judge1;
  let judge2;
  let judge3;

  const PLATFORM_FEE = 250; // 2.5% in basis points
  const VAULT_DEPOSIT = ethers.parseEther("10");
  const PAYOUTS = [100, 500, 2000, 5000]; // 1%, 5%, 20%, 50%

  beforeEach(async function () {
    [platformWallet, protocol, researcher1, researcher2, judge1, judge2, judge3] = 
      await ethers.getSigners();

    // Deploy VaultGuard
    const VaultGuard = await ethers.getContractFactory("VaultGuard");
    vaultGuard = await VaultGuard.deploy(platformWallet.address);
    await vaultGuard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct platform wallet and fee", async function () {
      expect(await vaultGuard.platformWallet()).to.equal(platformWallet.address);
      expect(await vaultGuard.platformFee()).to.equal(PLATFORM_FEE);
    });

    it("Should start with zero vaults and submissions", async function () {
      expect(await vaultGuard.vaultCount()).to.equal(0);
      expect(await vaultGuard.submissionCount()).to.equal(0);
    });
  });

  describe("Vault Creation", function () {
    it("Should allow protocol to create a vault", async function () {
      const judges = [judge1.address, judge2.address, judge3.address];
      const requiredApprovals = 2;

      await expect(
        vaultGuard.connect(protocol).createVault(judges, requiredApprovals, PAYOUTS, {
          value: VAULT_DEPOSIT,
        })
      )
        .to.emit(vaultGuard, "VaultCreated")
        .withArgs(0, protocol.address, VAULT_DEPOSIT);

      const vault = await vaultGuard.vaults(0);
      expect(vault.protocol).to.equal(protocol.address);
      expect(vault.totalDeposit).to.equal(VAULT_DEPOSIT);
      expect(vault.remainingFunds).to.equal(VAULT_DEPOSIT);
      expect(vault.active).to.be.true;
      expect(vault.requiredApprovals).to.equal(requiredApprovals);
    });

    it("Should reject vault creation without deposit", async function () {
      const judges = [judge1.address];
      await expect(
        vaultGuard.connect(protocol).createVault(judges, 1, PAYOUTS)
      ).to.be.revertedWith("Must deposit funds");
    });

    it("Should reject invalid approval threshold", async function () {
      const judges = [judge1.address];
      await expect(
        vaultGuard.connect(protocol).createVault(judges, 5, PAYOUTS, {
          value: VAULT_DEPOSIT,
        })
      ).to.be.revertedWith("Invalid approval threshold");
    });

    it("Should set correct payout percentages", async function () {
      const judges = [judge1.address];
      await vaultGuard.connect(protocol).createVault(judges, 1, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });

      expect(await vaultGuard.getPayoutPercentage(0, 0)).to.equal(PAYOUTS[0]); // LOW
      expect(await vaultGuard.getPayoutPercentage(0, 1)).to.equal(PAYOUTS[1]); // MEDIUM
      expect(await vaultGuard.getPayoutPercentage(0, 2)).to.equal(PAYOUTS[2]); // HIGH
      expect(await vaultGuard.getPayoutPercentage(0, 3)).to.equal(PAYOUTS[3]); // CRITICAL
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      const judges = [judge1.address];
      await vaultGuard.connect(protocol).createVault(judges, 1, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });
    });

    it("Should allow protocol to deposit additional funds", async function () {
      const additionalDeposit = ethers.parseEther("5");
      await expect(
        vaultGuard.connect(protocol).depositFunds(0, { value: additionalDeposit })
      )
        .to.emit(vaultGuard, "FundsDeposited")
        .withArgs(0, additionalDeposit);

      const vault = await vaultGuard.vaults(0);
      expect(vault.totalDeposit).to.equal(VAULT_DEPOSIT + additionalDeposit);
      expect(vault.remainingFunds).to.equal(VAULT_DEPOSIT + additionalDeposit);
    });

    it("Should reject deposits from non-protocol", async function () {
      await expect(
        vaultGuard.connect(researcher1).depositFunds(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Not vault owner");
    });
  });

  describe("Submissions", function () {
    beforeEach(async function () {
      const judges = [judge1.address, judge2.address];
      await vaultGuard.connect(protocol).createVault(judges, 2, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });
    });

    it("Should allow researcher to submit vulnerability", async function () {
      const reportHash = "QmTestHash123";
      await expect(
        vaultGuard.connect(researcher1).submitVulnerability(0, reportHash, 2) // HIGH
      )
        .to.emit(vaultGuard, "SubmissionCreated")
        .withArgs(0, 0, researcher1.address);

      const details = await vaultGuard.getSubmissionDetails(0);
      expect(details.vaultId).to.equal(0);
      expect(details.researcher).to.equal(researcher1.address);
      expect(details.reportHash).to.equal(reportHash);
      expect(details.severity).to.equal(2); // HIGH
      expect(details.status).to.equal(0); // PENDING
    });

    it("Should reject submission with empty hash", async function () {
      await expect(
        vaultGuard.connect(researcher1).submitVulnerability(0, "", 1)
      ).to.be.revertedWith("Report hash required");
    });

    it("Should track submissions per vault", async function () {
      await vaultGuard.connect(researcher1).submitVulnerability(0, "hash1", 1);
      await vaultGuard.connect(researcher2).submitVulnerability(0, "hash2", 2);

      const submissions = await vaultGuard.getVaultSubmissions(0);
      expect(submissions.length).to.equal(2);
      expect(submissions[0]).to.equal(0);
      expect(submissions[1]).to.equal(1);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      const judges = [judge1.address, judge2.address, judge3.address];
      await vaultGuard.connect(protocol).createVault(judges, 2, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });
      await vaultGuard.connect(researcher1).submitVulnerability(0, "QmTestHash", 2); // HIGH
    });

    it("Should allow judge to approve submission", async function () {
      await expect(
        vaultGuard.connect(judge1).voteOnSubmission(0, true)
      )
        .to.emit(vaultGuard, "SubmissionVoted")
        .withArgs(0, judge1.address, true);

      const details = await vaultGuard.getSubmissionDetails(0);
      expect(details.approvalCount).to.equal(1);
    });

    it("Should auto-approve when threshold is reached", async function () {
      await vaultGuard.connect(judge1).voteOnSubmission(0, true);
      
      await expect(
        vaultGuard.connect(judge2).voteOnSubmission(0, true)
      )
        .to.emit(vaultGuard, "SubmissionApproved");

      const details = await vaultGuard.getSubmissionDetails(0);
      expect(details.status).to.equal(1); // APPROVED
      expect(details.payoutAmount).to.be.gt(0);
    });

    it("Should reject submission if any judge votes no", async function () {
      await expect(
        vaultGuard.connect(judge1).voteOnSubmission(0, false)
      )
        .to.emit(vaultGuard, "SubmissionRejected")
        .withArgs(0);

      const details = await vaultGuard.getSubmissionDetails(0);
      expect(details.status).to.equal(2); // REJECTED
    });

    it("Should reject vote from non-judge", async function () {
      await expect(
        vaultGuard.connect(researcher1).voteOnSubmission(0, true)
      ).to.be.revertedWith("Not a judge");
    });

    it("Should reject duplicate votes", async function () {
      await vaultGuard.connect(judge1).voteOnSubmission(0, true);
      await expect(
        vaultGuard.connect(judge1).voteOnSubmission(0, true)
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("Payouts", function () {
    beforeEach(async function () {
      const judges = [judge1.address, judge2.address];
      await vaultGuard.connect(protocol).createVault(judges, 2, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });
      await vaultGuard.connect(researcher1).submitVulnerability(0, "QmTestHash", 3); // CRITICAL
      await vaultGuard.connect(judge1).voteOnSubmission(0, true);
      await vaultGuard.connect(judge2).voteOnSubmission(0, true);
    });

    it("Should allow researcher to claim approved payout", async function () {
      const details = await vaultGuard.getSubmissionDetails(0);
      const expectedPayout = details.payoutAmount;
      const initialBalance = await ethers.provider.getBalance(researcher1.address);

      const tx = await vaultGuard.connect(researcher1).claimPayout(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(researcher1.address);
      expect(finalBalance).to.equal(initialBalance + expectedPayout - gasUsed);

      const detailsAfter = await vaultGuard.getSubmissionDetails(0);
      expect(detailsAfter.status).to.equal(3); // PAID
    });

    it("Should send platform fee to platform wallet", async function () {
      const initialBalance = await ethers.provider.getBalance(platformWallet.address);
      await vaultGuard.connect(researcher1).claimPayout(0);
      const finalBalance = await ethers.provider.getBalance(platformWallet.address);
      
      // Platform should receive 2.5% of the base amount
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject claim from non-researcher", async function () {
      await expect(
        vaultGuard.connect(researcher2).claimPayout(0)
      ).to.be.revertedWith("Not the researcher");
    });

    it("Should reject claim for non-approved submission", async function () {
      await vaultGuard.connect(researcher2).submitVulnerability(0, "hash2", 1);
      await expect(
        vaultGuard.connect(researcher2).claimPayout(1)
      ).to.be.revertedWith("Not approved");
    });
  });

  describe("Vault Management", function () {
    beforeEach(async function () {
      const judges = [judge1.address];
      await vaultGuard.connect(protocol).createVault(judges, 1, PAYOUTS, {
        value: VAULT_DEPOSIT,
      });
    });

    it("Should allow protocol to close vault", async function () {
      const initialBalance = await ethers.provider.getBalance(protocol.address);
      
      const tx = await vaultGuard.connect(protocol).closeVault(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(vaultGuard, "VaultClosed")
        .withArgs(0, VAULT_DEPOSIT);

      const vault = await vaultGuard.vaults(0);
      expect(vault.active).to.be.false;
      expect(vault.remainingFunds).to.equal(0);

      const finalBalance = await ethers.provider.getBalance(protocol.address);
      expect(finalBalance).to.equal(initialBalance + VAULT_DEPOSIT - gasUsed);
    });

    it("Should reject close from non-protocol", async function () {
      await expect(
        vaultGuard.connect(researcher1).closeVault(0)
      ).to.be.revertedWith("Not vault owner");
    });

    it("Should prevent submissions to closed vault", async function () {
      await vaultGuard.connect(protocol).closeVault(0);
      await expect(
        vaultGuard.connect(researcher1).submitVulnerability(0, "hash", 1)
      ).to.be.revertedWith("Vault not active");
    });
  });
});

