const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZenithVault", function () {
  let zenithVault;
  let owner, seller, bidder1, bidder2, bidder3;

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
  });

  describe("Deployment", function () {
    it("Should initialize with zero auctions", async function () {
      expect(await zenithVault.nextAuctionId()).to.equal(0);
    });

    it("Should set the correct constants", async function () {
      expect(await zenithVault.MIN_DURATION()).to.equal(1 * 60 * 60); // 1 hour
      expect(await zenithVault.MAX_DURATION()).to.equal(30 * 24 * 60 * 60); // 30 days
      expect(await zenithVault.MIN_DEPOSIT()).to.equal(ethers.parseEther("0.001"));
      expect(await zenithVault.PLATFORM_FEE_BPS()).to.equal(250); // 2.5%
    });
  });

  describe("Auction Creation", function () {
    it("Should create a first-price auction", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0, // FirstPrice
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await expect(zenithVault.connect(seller).createAuction(auctionInput))
        .to.emit(zenithVault, "AuctionCreated");

      const auction = await zenithVault.getAuction(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.auctionType).to.equal(0);
      expect(auction.reservePrice).to.equal(RESERVE_PRICE);
      expect(auction.status).to.equal(0); // Active
    });

    it("Should create a second-price (Vickrey) auction", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 1, // SecondPrice
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(auctionInput);
      const auction = await zenithVault.getAuction(0);
      expect(auction.auctionType).to.equal(1);
    });

    it("Should fail if duration is too short", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: 30 * 60 // 30 minutes (less than MIN_DURATION)
      };

      await expect(
        zenithVault.connect(seller).createAuction(auctionInput)
      ).to.be.revertedWithCustomError(zenithVault, "InvalidDuration");
    });

    it("Should fail if duration is too long", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: 31 * 24 * 60 * 60 // 31 days (more than MAX_DURATION)
      };

      await expect(
        zenithVault.connect(seller).createAuction(auctionInput)
      ).to.be.revertedWithCustomError(zenithVault, "InvalidDuration");
    });

    it("Should fail if deposit amount is too low", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: ethers.parseEther("0.0001"), // Less than MIN_DEPOSIT
        duration: DURATION
      };

      await expect(
        zenithVault.connect(seller).createAuction(auctionInput)
      ).to.be.revertedWithCustomError(zenithVault, "InvalidDeposit");
    });

    it("Should increment auction ID after each creation", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(auctionInput);
      expect(await zenithVault.nextAuctionId()).to.equal(1);

      await zenithVault.connect(seller).createAuction(auctionInput);
      expect(await zenithVault.nextAuctionId()).to.equal(2);
    });
  });

  describe("Auction Queries", function () {
    beforeEach(async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      // Create 3 auctions
      await zenithVault.connect(seller).createAuction(auctionInput);
      await zenithVault.connect(seller).createAuction(auctionInput);
      await zenithVault.connect(seller).createAuction(auctionInput);
    });

    it("Should get auction count", async function () {
      expect(await zenithVault.getAuctionCount()).to.equal(3);
    });

    it("Should get active auctions", async function () {
      const activeAuctions = await zenithVault.getActiveAuctions();
      expect(activeAuctions.length).to.equal(3);
    });

    it("Should get auction by ID", async function () {
      const auction = await zenithVault.getAuction(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.auctionType).to.equal(0);
    });

    it("Should get auction item", async function () {
      const item = await zenithVault.getAuctionItem(0);
      expect(item.name).to.equal("Test NFT #1");
      expect(item.category).to.equal("Art");
      expect(item.tokenId).to.equal(1);
    });

    it("Should get user created auctions", async function () {
      const userAuctions = await zenithVault.getUserCreatedAuctions(seller.address);
      expect(userAuctions.length).to.equal(3);
    });

    it("Should get platform stats", async function () {
      const stats = await zenithVault.getPlatformStats();
      expect(stats.totalAuctions).to.equal(3);
      expect(stats.activeAuctions).to.equal(3);
      expect(stats.settledAuctions).to.equal(0);
    });
  });

  describe("Auction Status", function () {
    beforeEach(async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: 1 * 60 * 60 // 1 hour
      };

      await zenithVault.connect(seller).createAuction(auctionInput);
    });

    it("Should return correct time remaining", async function () {
      const timeRemaining = await zenithVault.getAuctionTimeRemaining(0);
      expect(timeRemaining).to.be.closeTo(1 * 60 * 60, 5); // Within 5 seconds
    });

    it("Should return zero time remaining after auction ends", async function () {
      await time.increase(2 * 60 * 60); // Fast forward 2 hours
      const timeRemaining = await zenithVault.getAuctionTimeRemaining(0);
      expect(timeRemaining).to.equal(0);
    });
  });

  describe("User Statistics", function () {
    it("Should return empty stats for user with no activity", async function () {
      const stats = await zenithVault.getUserStats(bidder1.address);
      expect(stats.totalBids).to.equal(0);
      expect(stats.totalWins).to.equal(0);
      expect(stats.totalCreated).to.equal(0);
      expect(stats.totalDeposited).to.equal(0);
      expect(stats.pendingRefunds).to.equal(0);
    });

    it("Should track created auctions count", async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(auctionInput);
      await zenithVault.connect(seller).createAuction(auctionInput);

      const stats = await zenithVault.getUserStats(seller.address);
      expect(stats.totalCreated).to.equal(2);
    });
  });

  describe("Category Filtering", function () {
    beforeEach(async function () {
      const artItem = { ...SAMPLE_ITEM, category: "Art" };
      const musicItem = { ...SAMPLE_ITEM, category: "Music" };
      const gamingItem = { ...SAMPLE_ITEM, category: "Gaming" };

      const auctionInput1 = {
        item: artItem,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      const auctionInput2 = {
        item: musicItem,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      const auctionInput3 = {
        item: gamingItem,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      await zenithVault.connect(seller).createAuction(auctionInput1);
      await zenithVault.connect(seller).createAuction(auctionInput2);
      await zenithVault.connect(seller).createAuction(auctionInput3);
    });

    it("Should filter auctions by category", async function () {
      const artAuctions = await zenithVault.getAuctionsByCategory("Art");
      expect(artAuctions.length).to.equal(1);

      const musicAuctions = await zenithVault.getAuctionsByCategory("Music");
      expect(musicAuctions.length).to.equal(1);

      const gamingAuctions = await zenithVault.getAuctionsByCategory("Gaming");
      expect(gamingAuctions.length).to.equal(1);
    });

    it("Should return empty array for non-existent category", async function () {
      const collectibles = await zenithVault.getAuctionsByCategory("Collectibles");
      expect(collectibles.length).to.equal(0);
    });
  });

  describe("Pagination", function () {
    beforeEach(async function () {
      const auctionInput = {
        item: SAMPLE_ITEM,
        auctionType: 0,
        reservePrice: RESERVE_PRICE,
        depositAmount: DEPOSIT_AMOUNT,
        duration: DURATION
      };

      // Create 10 auctions
      for (let i = 0; i < 10; i++) {
        await zenithVault.connect(seller).createAuction(auctionInput);
      }
    });

    it("Should paginate auctions correctly", async function () {
      const [page1, total] = await zenithVault.getAuctionsPaginated(0, 5);
      expect(page1.length).to.equal(5);
      expect(total).to.equal(10);

      const [page2] = await zenithVault.getAuctionsPaginated(5, 5);
      expect(page2.length).to.equal(5);
    });

    it("Should handle offset beyond total", async function () {
      const [page, total] = await zenithVault.getAuctionsPaginated(15, 5);
      expect(page.length).to.equal(0);
      expect(total).to.equal(10);
    });

    it("Should handle partial last page", async function () {
      const [lastPage] = await zenithVault.getAuctionsPaginated(7, 5);
      expect(lastPage.length).to.equal(3);
    });
  });
});
