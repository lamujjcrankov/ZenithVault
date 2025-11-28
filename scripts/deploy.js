const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying ZenithVault contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const ZenithVault = await hre.ethers.getContractFactory("ZenithVault");
  const zenithVault = await ZenithVault.deploy();

  await zenithVault.waitForDeployment();

  const address = await zenithVault.getAddress();
  console.log(`\n✅ ZenithVault deployed to: ${address}`);

  // Verify deployment
  const count = await zenithVault.getAuctionCount();
  console.log("Initial auction count:", count.toString());

  const categories = await zenithVault.getCategories();
  console.log("Available categories:", categories);

  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Contract: ZenithVault");
  console.log("Address:", address);
  console.log("Network:", hre.network.name);
  console.log("========================================");

  // Save deployment info
  const deploymentInfo = {
    contract: "ZenithVault",
    address: address,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");

  console.log(`\nUpdate your .env file with:`);
  console.log(`ZENITH_VAULT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
