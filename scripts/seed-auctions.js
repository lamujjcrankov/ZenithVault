const hre = require("hardhat");

async function main() {
  console.log("Seeding ZenithVault with sample auctions...");

  // Hardcoded contract address
  const contractAddress = "0x6dd08836B73DC2dd3e294De7f20b18802e282254";
  console.log("Contract address:", contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const ZenithVault = await hre.ethers.getContractFactory("ZenithVault");
  const zenithVault = ZenithVault.attach(contractAddress);

  // Sample auction data with ~30 day durations
  const sampleAuctions = [
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000001",
        tokenId: 1001,
        metadataUri: "ipfs://QmXyz123/metadata/1001",
        name: "Cosmic Dragon #42",
        description: "A rare cosmic dragon NFT from the legendary Dragon Realm collection. Features iridescent scales that shimmer across dimensions.",
        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
        category: "Art"
      },
      auctionType: 1, // SecondPrice (Vickrey)
      reservePrice: hre.ethers.parseEther("0.05"),
      depositAmount: hre.ethers.parseEther("0.01"),
      duration: 25 * 24 * 60 * 60 // 25 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000002",
        tokenId: 2001,
        metadataUri: "ipfs://QmAbc456/metadata/2001",
        name: "CryptoPunk Variant #8888",
        description: "Ultra-rare punk variant with golden mohawk and laser eyes. One of only 10 in existence.",
        imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800",
        category: "Collectibles"
      },
      auctionType: 0, // FirstPrice
      reservePrice: hre.ethers.parseEther("0.1"),
      depositAmount: hre.ethers.parseEther("0.02"),
      duration: 28 * 24 * 60 * 60 // 28 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000003",
        tokenId: 3001,
        metadataUri: "ipfs://QmDef789/metadata/3001",
        name: "Virtual Land Plot - Metaverse Prime",
        description: "Premium 10x10 land plot in the heart of Metaverse Prime district. Adjacent to major marketplace.",
        imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800",
        category: "Virtual Land"
      },
      auctionType: 1, // SecondPrice
      reservePrice: hre.ethers.parseEther("0.15"),
      depositAmount: hre.ethers.parseEther("0.03"),
      duration: 30 * 24 * 60 * 60 // 30 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000004",
        tokenId: 4001,
        metadataUri: "ipfs://QmGhi012/metadata/4001",
        name: "Genesis Music NFT - Synthwave Dreams",
        description: "Original synthwave track with exclusive stems and remix rights. Limited edition 1/1.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        category: "Music"
      },
      auctionType: 0, // FirstPrice
      reservePrice: hre.ethers.parseEther("0.03"),
      depositAmount: hre.ethers.parseEther("0.01"),
      duration: 20 * 24 * 60 * 60 // 20 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000005",
        tokenId: 5001,
        metadataUri: "ipfs://QmJkl345/metadata/5001",
        name: "Legendary Sword of Ethereum",
        description: "Mythical gaming asset from EtherQuest. +500 attack power, rare fire enchantment.",
        imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800",
        category: "Gaming"
      },
      auctionType: 1, // SecondPrice
      reservePrice: hre.ethers.parseEther("0.08"),
      depositAmount: hre.ethers.parseEther("0.015"),
      duration: 26 * 24 * 60 * 60 // 26 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000006",
        tokenId: 6001,
        metadataUri: "ipfs://QmMno678/metadata/6001",
        name: "Abstract Dimensions #7",
        description: "Generative art piece exploring fractal geometries in 4K resolution. Algorithm-verified unique.",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        category: "Art"
      },
      auctionType: 0, // FirstPrice
      reservePrice: hre.ethers.parseEther("0.06"),
      depositAmount: hre.ethers.parseEther("0.012"),
      duration: 22 * 24 * 60 * 60 // 22 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000007",
        tokenId: 7001,
        metadataUri: "ipfs://QmPqr901/metadata/7001",
        name: "Bored Ape Derivative #1337",
        description: "Community-created derivative artwork. Hand-drawn digital painting with original style.",
        imageUrl: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=800",
        category: "Collectibles"
      },
      auctionType: 1, // SecondPrice
      reservePrice: hre.ethers.parseEther("0.12"),
      depositAmount: hre.ethers.parseEther("0.025"),
      duration: 29 * 24 * 60 * 60 // 29 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000008",
        tokenId: 8001,
        metadataUri: "ipfs://QmStu234/metadata/8001",
        name: "DeFi Protocol Access Pass",
        description: "Lifetime premium access to exclusive DeFi yields and governance voting rights.",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        category: "Utility"
      },
      auctionType: 0, // FirstPrice
      reservePrice: hre.ethers.parseEther("0.2"),
      depositAmount: hre.ethers.parseEther("0.04"),
      duration: 27 * 24 * 60 * 60 // 27 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000009",
        tokenId: 9001,
        metadataUri: "ipfs://QmVwx567/metadata/9001",
        name: "Neon City Skyline",
        description: "Cyberpunk-inspired digital artwork. 8K resolution with animated elements.",
        imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
        category: "Art"
      },
      auctionType: 1, // SecondPrice
      reservePrice: hre.ethers.parseEther("0.04"),
      depositAmount: hre.ethers.parseEther("0.008"),
      duration: 24 * 24 * 60 * 60 // 24 days
    },
    {
      item: {
        nftContract: "0x0000000000000000000000000000000000000010",
        tokenId: 10001,
        metadataUri: "ipfs://QmYza890/metadata/10001",
        name: "Rare Domain: crypto.eth",
        description: "Premium ENS domain name. Perfect for crypto businesses and personal branding.",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
        category: "Domains"
      },
      auctionType: 0, // FirstPrice
      reservePrice: hre.ethers.parseEther("0.5"),
      depositAmount: hre.ethers.parseEther("0.1"),
      duration: 30 * 24 * 60 * 60 // 30 days
    }
  ];

  console.log(`\nCreating ${sampleAuctions.length} sample auctions...`);

  for (let i = 0; i < sampleAuctions.length; i++) {
    const auction = sampleAuctions[i];
    console.log(`\n[${i + 1}/${sampleAuctions.length}] Creating: ${auction.item.name}`);

    try {
      const tx = await zenithVault.createAuction({
        item: auction.item,
        auctionType: auction.auctionType,
        reservePrice: auction.reservePrice,
        depositAmount: auction.depositAmount,
        duration: auction.duration
      });

      const receipt = await tx.wait();
      console.log(`   ✅ Created - TX: ${receipt.hash}`);

      // Get auction ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = zenithVault.interface.parseLog(log);
          return parsed && parsed.name === "AuctionCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = zenithVault.interface.parseLog(event);
        console.log(`   Auction ID: ${parsed.args.auctionId}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  // Print summary
  console.log("\n========================================");
  console.log("Seeding Complete");
  console.log("========================================");

  const count = await zenithVault.getAuctionCount();
  console.log(`Total auctions: ${count}`);

  const activeAuctions = await zenithVault.getActiveAuctions();
  console.log(`Active auctions: ${activeAuctions.length}`);

  const stats = await zenithVault.getPlatformStats();
  console.log(`Platform stats:`);
  console.log(`  - Total: ${stats.totalAuctions}`);
  console.log(`  - Active: ${stats.activeAuctions}`);
  console.log(`  - Settled: ${stats.settledAuctions}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
