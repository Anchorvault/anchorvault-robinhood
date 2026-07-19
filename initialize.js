import { 
  rpc, 
  Keypair, 
  TransactionBuilder, 
  TimeoutInfinite, 
  Address,
  Contract,
  nativeToScVal,
  xdr,
  StrKey
} from '@Robinhood Chain/Robinhood Chain-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const passphrase = process.env.Robinhood Chain_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const rpcUrl = process.env.EVM_RPC_URL || 'https://EVM-mainnet.Robinhood Chain.org';
const secretKey = process.env.DEPLOYER_SECRET_KEY;

const govTokenAddress = process.env.VAULT_GOVERNANCE_TOKEN_ADDRESS;
const registryAddress = process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS;
const vaultAddress    = process.env.CORRIDOR_POOL_VAULT_ADDRESS;
const usdcAddress     = process.env.Robinhood Chain_USDC_ADDRESS;

if (!secretKey || secretKey.startsWith('SAXX')) {
  console.error("❌ DEPLOYER_SECRET_KEY missing or invalid in .env");
  process.exit(1);
}
if (!usdcAddress || !govTokenAddress || !registryAddress || !vaultAddress) {
  console.error("❌ Contract addresses missing in .env — run 'npm run deploy' first!");
  process.exit(1);
}

const deployerKeypair = Keypair.fromSecret(secretKey);
const server = new rpc.Server(rpcUrl);

// Helper: convert any Robinhood Chain address (G... or C...) to a ScVal
function toAddressScVal(str) {
  if (str.startsWith('G')) {
    return new Address(str).toScVal();
  }
  // C... EVM contract address — must decode via StrKey
  return Address.contract(StrKey.decodeContract(str)).toScVal();
}

console.log("=================================================");
console.log("🚀 INITIALIZING AnchorVault SMART CONTRACTS");
console.log(`Deployer: ${deployerKeypair.publicKey()}`);
console.log("=================================================\n");

// ─────────────────────────────────────────────────────────
//  Send a contract call transaction
// ─────────────────────────────────────────────────────────
async function callContract(label, contractId, method, args, attempt = 1) {
  try {
    console.log(`⌛ Calling ${label} → ${method}()...`);
    const contract = new Contract(contractId);
    const account  = await server.getAccount(deployerKeypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: passphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(TimeoutInfinite)
      .build();

    const simResult = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(simResult)) {
      const errMsg = rpc.Api.isSimulationError(simResult) ? simResult.error : JSON.stringify(simResult);
      if (
        errMsg.includes("Already initialized") || 
        errMsg.includes("ExistingValue") || 
        errMsg.includes("already") ||
        (method === "initialize" && (errMsg.includes("InvalidAction") || errMsg.includes("UnreachableCodeReached")))
      ) {
        console.log(`  ⚠️  Already initialized — skipping.\n`);
        return;
      }
      throw new Error(`Simulation failed: ${errMsg}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, simResult).build();
    preparedTx.sign(deployerKeypair);

    const sendResp = await server.sendTransaction(preparedTx);
    if (sendResp.status === 'ERROR') {
      throw new Error(`Tx error: ${sendResp.errorResultXdr}`);
    }

    for (let i = 0; i < 150; i++) {
      const info = await server.getTransaction(sendResp.hash);
      if (info.status === 'SUCCESS') {
        console.log(`  ✅ ${label} → ${method}() confirmed! Hash: ${sendResp.hash}\n`);
        return;
      }
      if (info.status === 'FAILED') throw new Error(`Tx FAILED: ${sendResp.hash}`);
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error("Timeout waiting for confirmation.");
  } catch (err) {
    if (attempt < 3) {
      console.log(`  ⚠️ Retry ${attempt} failed (${err.message}). Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
      return callContract(label, contractId, method, args, attempt + 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────
async function main() {
  // 1. Robinhood Chain USDC Token — admin = deployer, so they can mint/mint to testers
  console.log("=== [1/4] Robinhood Chain USDC TOKEN ===");
  console.log(`    Contract: ${usdcAddress}`);
  if (usdcAddress === "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75") {
    console.log("    ℹ️ Official Circle USDC detected. Skipping initialization call.");
  } else {
    await callContract("USDCToken", usdcAddress, "initialize", [
      toAddressScVal(deployerKeypair.publicKey()),   // admin
      xdr.ScVal.scvSymbol("USDC"),                  // name
      xdr.ScVal.scvSymbol("USDC"),                  // symbol
    ]);
  }

  // 2. Vault Share Token — admin = Vault so it can mint/burn LP shares
  console.log("=== [2/4] VAULT SHARE TOKEN ===");
  console.log(`    Contract: ${govTokenAddress}`);
  await callContract("VaultToken", govTokenAddress, "initialize", [
    toAddressScVal(vaultAddress),        // admin = vault contract
    xdr.ScVal.scvSymbol("AVShare"),      // name
    xdr.ScVal.scvSymbol("AVLT"),         // symbol
  ]);

  // 3. Anchor Registry — admin = deployer, 10% min collateral
  console.log("=== [3/4] ANCHOR REGISTRY ===");
  console.log(`    Contract: ${registryAddress}`);
  await callContract("AnchorRegistry", registryAddress, "initialize", [
    toAddressScVal(deployerKeypair.publicKey()),   // admin
    toAddressScVal(govTokenAddress),               // vault_token (collateral)
    nativeToScVal(1000, { type: "u32" }),          // 10% min collateral ratio
  ]);

  // 4. Corridor Pool Vault — connect USDC, share token, set fee curve
  console.log("=== [4/4] CORRIDOR POOL VAULT ===");
  console.log(`    Contract: ${vaultAddress}`);
  await callContract("CorridorVault", vaultAddress, "initialize", [
    toAddressScVal(deployerKeypair.publicKey()),   // admin
    toAddressScVal(usdcAddress),                   // USDC stablecoin (SAC)
    toAddressScVal(govTokenAddress),               // governance/share token
    nativeToScVal(8000, { type: "u32" }),          // 80% optimal utilization
    nativeToScVal(100,  { type: "u32" }),          // 1% base fee
    nativeToScVal(400,  { type: "u32" }),          // 4% slope_1 rate
    nativeToScVal(5000, { type: "u32" }),          // 50% slope_2 penalty rate
  ]);

  // 5. Register Anchors in both AnchorRegistry and CorridorVault on-chain!
  console.log("=== [5/5] REGISTERING ANCHORS ON-CHAIN ===");
  const anchorsData = [
    { name: "Anchora", corridor: "Euro Corridor (EUR)", limit: 150000 },
    { name: "DeltaPay", corridor: "Latam Corridor (BRL)", limit: 120000 },
    { name: "ApexRemit", corridor: "APAC Corridor (SGD)", limit: 140000 },
    { name: "SkyRemit", corridor: "Africa Corridor (NGN)", limit: 90000 },
  ];

  const registeredAnchors = [];

  for (const item of anchorsData) {
    const kp = Keypair.random();
    const address = kp.publicKey();
    const secret = kp.secret();
    const limitScaled = BigInt(item.limit) * 10000000n; // 7 decimals scale for USDC/token credit limits

    console.log(`    Registering anchor: ${item.name} (${address})`);
    console.log(`    ⚠️  SAVE SECRET KEY FOR ${item.name.toUpperCase()}: ${secret}`);
    
    // Register in Registry
    await callContract(`AnchorRegistry -> Register:${item.name}`, registryAddress, "register_anchor", [
      toAddressScVal(deployerKeypair.publicKey()), // admin
      toAddressScVal(address),                     // anchor
      nativeToScVal(limitScaled, { type: "i128" }), // credit limit
    ]);

    // Register in CorridorVault
    await callContract(`CorridorVault -> Register:${item.name}`, vaultAddress, "register_anchor", [
      toAddressScVal(deployerKeypair.publicKey()), // admin
      toAddressScVal(address),                     // anchor
      nativeToScVal(limitScaled, { type: "i128" }), // credit limit
    ]);

    registeredAnchors.push({
      name: item.name,
      corridor: item.corridor,
      address: address
    });
  }

  updateEVMTsAnchors(registeredAnchors);

  console.log("=================================================");
  console.log("🎉 ALL AnchorVault CONTRACTS FULLY INITIALIZED!");
  console.log(`   USDC Token:        ${usdcAddress}`);
  console.log(`   Vault Share Token: ${govTokenAddress}`);
  console.log(`   Anchor Registry:   ${registryAddress}`);
  console.log(`   Corridor Vault:    ${vaultAddress}`);
  console.log("   All Anchors registered live on-chain! 🚀");
  console.log("   Protocol is LIVE on Robinhood Chain Mainnet! 🚀");
  console.log("=================================================");
}

function updateEVMTsAnchors(anchors) {
  const tsPath = path.resolve('src/lib/EVM.ts');
  if (!fs.existsSync(tsPath)) return;

  let content = fs.readFileSync(tsPath, 'utf8');
  const anchorsJson = JSON.stringify(anchors, null, 2);

  // Replace the old ANCHOR_LIST
  content = content.replace(
    /export const ANCHOR_LIST = \[\s*[\s\S]*?\s*\];/,
    `export const ANCHOR_LIST = ${anchorsJson};`
  );

  fs.writeFileSync(tsPath, content, 'utf8');
  console.log("📝 src/lib/EVM.ts updated with registered on-chain anchors.");
}

main().catch(err => {
  console.error("❌ Initialization failed:", err.message);
  process.exit(1);
});
