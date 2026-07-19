import hre from "hardhat";

async function main() {
  console.log("Starting deployment to Robinhood Chain...");

  // 1. Deploy VaultToken
  console.log("Deploying VaultToken...");
  const VaultToken = await hre.ethers.getContractFactory("VaultToken");
  const vaultToken = await VaultToken.deploy();
  await vaultToken.waitForDeployment();
  const vaultTokenAddress = await vaultToken.getAddress();
  console.log(`VaultToken deployed to: ${vaultTokenAddress}`);

  // 2. Deploy AnchorRegistry
  console.log("Deploying AnchorRegistry...");
  const AnchorRegistry = await hre.ethers.getContractFactory("AnchorRegistry");
  const anchorRegistry = await AnchorRegistry.deploy(vaultTokenAddress);
  await anchorRegistry.waitForDeployment();
  const anchorRegistryAddress = await anchorRegistry.getAddress();
  console.log(`AnchorRegistry deployed to: ${anchorRegistryAddress}`);

  // 3. Deploy mock USDC token for testing
  console.log("Deploying Mock USDC...");
  const MockUSDC = await hre.ethers.getContractFactory("VaultToken");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`Mock USDC deployed to: ${usdcAddress}`);

  // 4. Deploy AnchorVault (Core Routing Engine)
  console.log("Deploying AnchorVault...");
  const AnchorVault = await hre.ethers.getContractFactory("AnchorVault");
  const anchorVault = await AnchorVault.deploy(usdcAddress, anchorRegistryAddress);
  await anchorVault.waitForDeployment();
  const anchorVaultAddress = await anchorVault.getAddress();
  console.log(`AnchorVault deployed to: ${anchorVaultAddress}`);

  console.log("\n=== Deployment Successful ===");
  console.log("VaultToken:", vaultTokenAddress);
  console.log("AnchorRegistry:", anchorRegistryAddress);
  console.log("Mock USDC:", usdcAddress);
  console.log("AnchorVault:", anchorVaultAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
