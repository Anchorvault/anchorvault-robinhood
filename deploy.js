import { 
  rpc, 
  Keypair, 
  Operation, 
  TransactionBuilder, 
  TimeoutInfinite, 
  Address,
  scValToNative,
  StrKey
} from '@Robinhood Chain/Robinhood Chain-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
// Load local private environment variables from .env
dotenv.config();

const network = process.env.Robinhood Chain_NETWORK || 'testnet';
const rpcUrl = process.env.EVM_RPC_URL || 'https://EVM-testnet.Robinhood Chain.org';
const passphrase = process.env.Robinhood Chain_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

const secretKey = process.env.DEPLOYER_SECRET_KEY;

if (!secretKey || secretKey.startsWith('SAXX')) {
  console.error("❌ ERROR: DEPLOYER_SECRET_KEY is missing or invalid in your .env file!");
  console.error("Run: node setup_keys.js — to generate and fund a fresh testnet deployer account.");
  process.exit(1);
}

const deployerKeypair = Keypair.fromSecret(secretKey);
const server = new rpc.Server(rpcUrl);

console.log("=================================================");
console.log(`🚀 Anchor Wallet ${network.toUpperCase()} DEPLOYMENT`);
console.log(`Network: ${network}`);
console.log(`RPC Node: ${rpcUrl}`);
console.log(`Deployer: ${deployerKeypair.publicKey()}`);
console.log("=================================================\n");

// ─────────────────────────────────────────────────────────
//  UPLOAD WASM — idempotent, returns the wasm hash hex
// ─────────────────────────────────────────────────────────
async function uploadWasm(wasmPath) {
  const absolutePath = path.resolve(wasmPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`WASM not found: ${absolutePath}. Build contracts with cargo first.`);
  }

  console.log(`📤 Uploading WASM: ${path.basename(wasmPath)}...`);
  const wasmBytes = fs.readFileSync(absolutePath);
  const computedHashHex = crypto.createHash('sha256').update(wasmBytes).digest('hex');

  try {
    const account = await server.getAccount(deployerKeypair.publicKey());

    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: passphrase })
      .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
      .setTimeout(TimeoutInfinite)
      .build();

    console.log("  ⌛ Simulating...");
    const prepared = await server.prepareTransaction(tx);
    prepared.sign(deployerKeypair);

    console.log("  ⌛ Submitting to Robinhood Chain network...");
    const sendResp = await server.sendTransaction(prepared);
    if (sendResp.status === 'ERROR') {
      console.log(`  ⚠️ Upload rejected (likely duplicate). Using computed hash: ${computedHashHex}`);
      return computedHashHex;
    }

    const txInfo = await pollForResult(sendResp.hash);
    console.log(`  ✅ WASM uploaded! Hash: ${computedHashHex}\n`);
    return computedHashHex;
  } catch (err) {
    console.log(`  ⚠️ Upload error (${err.message}). Using computed hash: ${computedHashHex}`);
    return computedHashHex;
  }
}

// ─────────────────────────────────────────────────────────
//  INSTANTIATE CONTRACT — returns the C... contract address
// ─────────────────────────────────────────────────────────
async function instantiateContract(wasmHashHex, saltHex, attempt = 1) {
  try {
    console.log(`🏗  Instantiating contract (salt: ${saltHex.slice(0, 8)}...)...`);
    const account = await server.getAccount(deployerKeypair.publicKey());

    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: passphrase })
      .addOperation(
        Operation.createCustomContract({
          wasmHash: Buffer.from(wasmHashHex, 'hex'),
          address: Address.fromString(deployerKeypair.publicKey()),
          salt: Buffer.from(saltHex, 'hex'),
        })
      )
      .setTimeout(TimeoutInfinite)
      .build();

    console.log("  ⌛ Simulating...");
    const prepared = await server.prepareTransaction(tx);
    prepared.sign(deployerKeypair);

    console.log("  ⌛ Submitting...");
    const sendResp = await server.sendTransaction(prepared);
    if (sendResp.status === 'ERROR') {
      throw new Error(`Instantiate tx error: ${sendResp.errorResultXdr || 'Unknown'}`);
    }

    const txInfo = await pollForResult(sendResp.hash);
    if (!txInfo.returnValue) throw new Error("Instantiate succeeded but no returnValue found.");

    const rawAddress = scValToNative(txInfo.returnValue);
    let contractId;
    if (typeof rawAddress === 'string') {
      contractId = rawAddress;
    } else {
      contractId = StrKey.encodeContract(Buffer.from(rawAddress));
    }
    console.log(`  🎉 Deployed at: ${contractId}\n`);
    return contractId;
  } catch (err) {
    if (attempt < 3) {
      console.log(`  ⚠️ Retry ${attempt} failed (${err.message}). Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
      return instantiateContract(wasmHashHex, crypto.randomBytes(32).toString('hex'), attempt + 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
//  POLL for transaction confirmation
// ─────────────────────────────────────────────────────────
async function pollForResult(hash) {
  for (let i = 0; i < 150; i++) {
    const info = await server.getTransaction(hash);
    if (info.status === 'SUCCESS') return info;
    if (info.status === 'FAILED') {
      throw new Error(`Transaction FAILED on-chain. Hash: ${hash}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Transaction confirmation timed out. Hash: ${hash}`);
}

// ─────────────────────────────────────────────────────────
//  UPDATE .env file with new addresses
// ─────────────────────────────────────────────────────────
function updateEnvFile(registryAddress, tokenAddress, vaultAddress, usdcAddress) {
  const envPath = path.resolve('.env');
  let content = fs.readFileSync(envPath, 'utf8');

  content = content.replace(
    /Robinhood Chain_USDC_ADDRESS=.*/,
    `Robinhood Chain_USDC_ADDRESS="${usdcAddress}"`
  );
  content = content.replace(
    /VAULT_GOVERNANCE_TOKEN_ADDRESS=.*/,
    `VAULT_GOVERNANCE_TOKEN_ADDRESS="${tokenAddress}"`
  );
  content = content.replace(
    /ANCHOR_REGISTRY_CONTRACT_ADDRESS=.*/,
    `ANCHOR_REGISTRY_CONTRACT_ADDRESS="${registryAddress}"`
  );
  content = content.replace(
    /CORRIDOR_POOL_VAULT_ADDRESS=.*/,
    `CORRIDOR_POOL_VAULT_ADDRESS="${vaultAddress}"`
  );

  fs.writeFileSync(envPath, content, 'utf8');
  console.log("📝 .env updated with new contract addresses.");
}

// ─────────────────────────────────────────────────────────
//  UPDATE src/lib/EVM.ts with new addresses
// ─────────────────────────────────────────────────────────
function updateEVMTs(registryAddress, tokenAddress, vaultAddress, usdcAddress) {
  const tsPath = path.resolve('src/lib/EVM.ts');
  if (!fs.existsSync(tsPath)) return;

  let content = fs.readFileSync(tsPath, 'utf8');

  content = content.replace(
    /USDC:\s*"[^"]*"/,
    `USDC: "${usdcAddress}"`
  );
  content = content.replace(
    /GOVERNANCE_TOKEN:\s*"[^"]*"/,
    `GOVERNANCE_TOKEN: "${tokenAddress}"`
  );
  content = content.replace(
    /ANCHOR_REGISTRY:\s*"[^"]*"/,
    `ANCHOR_REGISTRY: "${registryAddress}"`
  );
  content = content.replace(
    /CORE_VAULT:\s*"[^"]*"/,
    `CORE_VAULT: "${vaultAddress}"`
  );

  fs.writeFileSync(tsPath, content, 'utf8');
  console.log("📝 src/lib/EVM.ts updated with new contract addresses.");
}

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────
async function main() {
  // Unique salts per contract to avoid address collisions
  const genSalt = () => crypto.randomBytes(32).toString('hex');
  const SALTS = {
    usdc:     genSalt(),
    registry: genSalt(),
    token:    genSalt(),
    vault:    genSalt(),
  };

  const wasmPaths = {
    usdc:     './target/wasm32v1-none/release/vault_token.wasm',
    registry: './target/wasm32v1-none/release/anchor_registry.wasm',
    token:    './target/wasm32v1-none/release/vault_token.wasm',
    vault:    './target/wasm32v1-none/release/anchor_vault.wasm',
  };

  let usdcAddress;
  let usdcWasmHash;
  if (network === 'mainnet') {
    console.log("=== [1/4] Robinhood Chain USDC TOKEN ===");
    console.log("ℹ️ Running on MAINNET: Using official Circle USDC Robinhood Chain Asset Contract ID.");
    usdcAddress = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
    console.log(`  🎉 USDC Contract ID: ${usdcAddress}\n`);
  } else {
    console.log("=== [1/4] Robinhood Chain USDC TOKEN ===");
    usdcWasmHash = await uploadWasm(wasmPaths.usdc);
    usdcAddress  = await instantiateContract(usdcWasmHash, SALTS.usdc);
  }

  console.log("=== [2/4] ANCHOR REGISTRY ===");
  const registryWasmHash = await uploadWasm(wasmPaths.registry);
  const registryAddress  = await instantiateContract(registryWasmHash, SALTS.registry);

  console.log("=== [3/4] VAULT SHARE TOKEN ===");
  const tokenWasmHash = usdcWasmHash; // Reuse already uploaded wasm
  const tokenAddress  = await instantiateContract(tokenWasmHash, SALTS.token);

  console.log("=== [4/4] CORRIDOR POOL VAULT ===");
  const vaultWasmHash = await uploadWasm(wasmPaths.vault);
  const vaultAddress  = await instantiateContract(vaultWasmHash, SALTS.vault);

  console.log("=================================================");
  console.log(`🎉 ALL CONTRACTS DEPLOYED ON Robinhood Chain ${network.toUpperCase()}!`);
  console.log(`   USDC Token:        ${usdcAddress}`);
  console.log(`   Anchor Registry:   ${registryAddress}`);
  console.log(`   Vault Share Token: ${tokenAddress}`);
  console.log(`   Corridor Vault:    ${vaultAddress}`);
  console.log("=================================================\n");

  updateEnvFile(registryAddress, tokenAddress, vaultAddress, usdcAddress);
  updateEVMTs(registryAddress, tokenAddress, vaultAddress, usdcAddress);

  console.log("\n✅ All done! Run 'npm run initialize' next to set up protocol parameters.");
}

main().catch(err => {
  console.error("❌ Fatal deployment error:", err.message);
  process.exit(1);
});
