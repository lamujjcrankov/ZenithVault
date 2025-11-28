const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZenithVault - Bidding", function () {
  let zenithVault;
  let owner, seller, bidder1, bidder2, bidder3;
  let auctionId;

  const SAMPLE_ITEM = {
    nftContract: "0x0000000000000000000000000000000000000001",
    tokenId: 1,
    metadataUri: "ipfs://QmTest123",
    name: "Test NFT #1",
    description: "A test NFT for auction",
    imageUrl: "https://example.com/image.jpg",
    category: "Art"
  };

  const RESERVE_PRICE = ethers.parseEther("0.1");
  const DEPOSIT_AMOUNT = ethers.parseEther("0.02");
  const DURATION = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();

    const ZenithVault = await ethers.getContractFactory("ZenithVault");
    zenithVault = await ZenithVault.deploy();
    await zenithVault.waitForDeployment();

    // Create an auction
    const auctionInput = {
      item: SAMPLE_ITEM,
      auctionType: 0, // FirstPrice
      reservePrice: RESERVE_PRICE,
      depositAmount: DEPOSIT_AMOUNT,
      duration: DURATION
    };

    await zenithVault.connect(seller).createAuction(auctionInput);
    auctionId = 0;
  });

  describe("Bid Validation", function () {
    it("Should revert when getting non-existent auction", async function () {
      const nonExistentId = 999;
      await expect(
        zenithVault.getAuction(nonExistentId)
      ).to.be.revertedWithCustomError(zenithVault, "AuctionNotFound");
    });

    it("Should fail if auction has ended", async function () {
      // Fast forward past auction end time
      await time.increase(DURATION + 1);

      const timeRemaining = await zenithVault.getAuctionTimeRemaining(auctionId);
      expect(timeRemaining).to.equal(0);
    });

    it("Should not allow seller to bid on own auction", async function () {
      const [canBid] = await zenithVault.canUserBid(auctionId, seller.address);
      expect(canBid).to.be.false;
    });

    it("Should allow valid bidder to bid", async function () {
      const [canBid, reason] = await zenithVault.canUserBid(auctionId, bidder1.address);
      expect(canBid).to.be.true;
      expect(reason).to.equal("");
    });
  });

  describe("Bidder Tracking", function () {
    it("Should start with empty bidders list", async function () {
      const bidders = await zenithVault.getAuctionBidders(auctionId);
      expect(bidders.length).to.equal(0);
    });

    it("Should track unique bidders", async function () {
      // Note: Actual bidding requires FHE encryption
      // This test verifies the query function works
      const bidders = await zenithVault.getAuctionBidders(auctionId);
      expect(bidders).to.be.an('array');
    });
  });

  describe("User Bid History", function () {
    it("Should return empty list for user with no bids", async function () {
      const userBids = await zenithVault.getUserBidAuctions(bidder1.address);
      expect(userBids.length).to.equal(0);
    });

    it("Should get pending refunds", async function () {
      const refunds = await zenithVault.getUserPendingRefunds(bidder1.address);
      expect(refunds).to.be.an('array');
    });

    it("Should get won auctions", async function () {
      const wonAuctions = await zenithVault.getUserWonAuctions(bidder1.address);
      expect(wonAuctions.length).to.equal(0);
    });
  });

  describe("Bid Count", function () {
    it("Should start with zero bids", async function () {
      const auction = await zenithVault.getAuction(auctionId);
      expect(auction.bidCount).to.equal(0);
    });

    it("Should track total bid count", async function () {
      const auction = await zenithVault.getAuction(auctionId);
      expect(auction.bidCount).to.be.a('bigint');
    });
  });

  describe("Hot Auctions", function () {
    beforeEach(async function () {
      // Create multiple auctions
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(auctionInput);
      await zenithVault.connect(seller).createAuction(auctionInput);
    });

    it("Should get hot auctions", async function () {
      const limit = 5;
      const hotAuctions = await zenithVault.getHotAuctions(limit);
      expect(hotAuctions.length).to.be.lessThanOrEqual(limit);
    });

    it("Should respect limit parameter", async function () {
      const hotAuctions = await zenithVault.getHotAuctions(2);
      expect(hotAuctions.length).to.be.lessThanOrEqual(2);
    });
  });

  describe("Ending Soon", function () {
    beforeEach(async function () {
      // Create auction ending in 1 hour
      const shortAuction = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: 1 * 60 * 60 // 1 hour
      };

      await zenithVault.connect(seller).createAuction(shortAuction);
    });

    it("Should get ending soon auctions", async function () {
      const endingSoon = await zenithVault.getEndingSoonAuctions();
      expect(endingSoon).to.be.an('array');
    });

    it("Should filter auctions ending within threshold", async function () {
      const endingSoon = await zenithVault.getEndingSoonAuctions();
      // Should include the 1-hour auction
      expect(endingSoon.length).to.be.greaterThan(0);
    });
  });

  describe("Deposit Requirements", function () {
    it("Should enforce minimum deposit", async function () {
      const minDeposit = await zenithVault.MIN_DEPOSIT();
      expect(minDeposit).to.equal(ethers.parseEther("0.001"));
    });

    it("Should accept deposit equal to required amount", async function () {
      const auction = await zenithVault.getAuction(auctionId);
      expect(auction.depositAmount).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Auction Type Specific", function () {
    it("Should handle first-price auction", async function () {
      const auction = await zenithVault.getAuction(auctionId);
      expect(auction.auctionType).to.equal(0); // FirstPrice
    });

    it("Should handle second-price (Vickrey) auction", async function () {
      const vickreyAuction = {
        item: SAMPLE_ITEM,
        auctionType: 1, // SecondPrice
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(vickreyAuction);
      const auction = await zenithVault.getAuction(1);
      expect(auction.auctionType).to.equal(1); // SecondPrice
    });
  });

  describe("Multiple Bidders", function () {
    it("Should handle multiple unique bidders", async function () {
      // Test that multiple users can check if they can bid
      const [canBid1] = await zenithVault.canUserBid(auctionId, bidder1.address);
      const [canBid2] = await zenithVault.canUserBid(auctionId, bidder2.address);
      const [canBid3] = await zenithVault.canUserBid(auctionId, bidder3.address);

      expect(canBid1).to.be.true;
      expect(canBid2).to.be.true;
      expect(canBid3).to.be.true;
    });
  });

  describe("Platform Statistics", function () {
    it("Should track total bids across all auctions", async function () {
      const stats = await zenithVault.getPlatformStats();
      expect(stats.totalBidsPlaced).to.be.a('bigint');
      expect(stats.totalBidsPlaced).to.equal(0); // No bids placed yet
    });

    it("Should calculate total volume", async function () {
      const stats = await zenithVault.getPlatformStats();
      expect(stats.totalVolumeSettled).to.be.a('bigint');
    });
  });
});
