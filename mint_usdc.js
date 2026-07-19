import { 
  rpc, 
  Keypair, 
  TransactionBuilder, 
  TimeoutInfinite, 
  Address,
  Contract,
  nativeToScVal,
  xdr,
} from '@Robinhood Chain/Robinhood Chain-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const passphrase = process.env.Robinhood Chain_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const rpcUrl = process.env.EVM_RPC_URL || 'https://EVM-testnet.Robinhood Chain.org';
const secretKey = process.env.DEPLOYER_SECRET_KEY;
const usdcAddress = process.env.Robinhood Chain_USDC_ADDRESS;

if (!secretKey) {
  console.error("❌ DEPLOYER_SECRET_KEY missing in .env");
  process.exit(1);
}
if (!usdcAddress) {
  console.error("❌ Robinhood Chain_USDC_ADDRESS missing in .env");
  process.exit(1);
}

const targetAddress = process.argv[2] || "GCQ2XECG2CLPTRMXAWISSJDIXWMG4KOPVSNBVTHNLN3O3K2JZHXWCKHV";

async function mint() {
  console.log(`🚀 Minting 10,000 mock USDC to address: ${targetAddress}...`);
  const deployerKeypair = Keypair.fromSecret(secretKey);
  const server = new rpc.Server(rpcUrl);
  
  console.log("⌛ Querying account details...");
  const account = await server.getAccount(deployerKeypair.publicKey());
  const contract = new Contract(usdcAddress);
  
  const amountScaled = 10000n * 10000000n; // 10,000 USDC with 7 decimals
  
  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: passphrase,
  })
  .addOperation(
    contract.call(
      "mint",
      new Address(targetAddress).toScVal(),
      nativeToScVal(amountScaled, { type: "i128" })
    )
  )
  .setTimeout(TimeoutInfinite)
  .build();
  
  console.log("⌛ Simulating transaction...");
  const simResult = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error || JSON.stringify(simResult)}`);
  }
  
  console.log("⌛ Assembling footprint and EVM resources...");
  const preparedTx = rpc.assembleTransaction(tx, simResult).build();
  preparedTx.sign(deployerKeypair);
  
  console.log("⌛ Submitting minting transaction to Robinhood Chain Testnet...");
  const response = await server.sendTransaction(preparedTx);
  if (response.status === "PENDING") {
    let txResult = await server.getTransaction(response.hash);
    while (txResult.status === "NOT_FOUND" || txResult.status === "PENDING") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      txResult = await server.getTransaction(response.hash);
    }
    if (txResult.status === "SUCCESS") {
      console.log(`\n🎉 SUCCESS! Minted 10,000 mock USDC to ${targetAddress}`);
      console.log(`🔗 Transaction Hash: ${response.hash}\n`);
    } else {
      console.error("❌ Transaction failed in execution:", txResult.resultXdr);
    }
  } else {
    console.error("❌ Submission failed:", response);
  }
}

mint().catch(err => {
  console.error("❌ Error minting USDC:", err.message || err);
});
