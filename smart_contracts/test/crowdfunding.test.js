const { expect } = require("chai");
const hre = require("hardhat");

describe("Crowdfunding Contract", function () {
  let Crowdfunding;
  let crowdfunding;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    crowdfunding = await Crowdfunding.deploy();
  });

  describe("Campaign Creation", function () {
    it("Should create a new campaign", async function () {
      const goal = hre.ethers.parseEther("1");
      const duration = 7; // 7 days
      
      await crowdfunding.createCampaign("Test Campaign", "Description", "https://img.com", goal, duration);
      
      const campaigns = await crowdfunding.getCampaigns();
      expect(campaigns.length).to.equal(1);
      expect(campaigns[0].title).to.equal("Test Campaign");
      expect(campaigns[0].goal).to.equal(goal);
    });
  });

  describe("Donations", function () {
    it("Should accept donations", async function () {
      const goal = hre.ethers.parseEther("1");
      await crowdfunding.createCampaign("Test Campaign", "Description", "https://img.com", goal, 7);
      
      const donationAmount = hre.ethers.parseEther("0.5");
      await crowdfunding.connect(addr1).donate(0, { value: donationAmount });

      const campaign = (await crowdfunding.getCampaigns())[0];
      expect(campaign.amountRaised).to.equal(donationAmount);
    });
  });
});
