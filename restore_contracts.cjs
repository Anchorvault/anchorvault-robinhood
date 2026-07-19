// restore_contracts.cjs — Restores archived Soroban contracts on Stellar Testnet
const dotenv = require('dotenv');
dotenv.config();

const sdk = require('@stellar/stellar-sdk');
const { rpc, Keypair, TransactionBuilder, TimeoutInfinite, Operation, Contract, xdr, SorobanDataBuilder } = sdk;

const rpcUrl     = process.env.SOROBAN_RPC_URL;
const passphrase = process.env.STELLAR_NETWORK_PASSPHRASE;
const secretKey  = process.env.DEPLOYER_SECRET_KEY;
const server     = new rpc.Server(rpcUrl);
const keypair    = Keypair.fromSecret(secretKey);

const CONTRACTS = [
  { name: 'USDC Token',        id: process.env.STELLAR_USDC_ADDRESS },
  { name: 'Vault Share Token', id: process.env.VAULT_GOVERNANCE_TOKEN_ADDRESS },
  { name: 'Anchor Registry',   id: process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS },
  { name: 'Corridor Vault',    id: process.env.CORRIDOR_POOL_VAULT_ADDRESS },
];

function instanceLedgerKey(contractId) {
  return xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Contract(contractId).address().toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
}

async function waitTx(hash, label) {
  for (let i = 0; i < 120; i++) {
    const info = await server.getTransaction(hash);
    if (info.status === 'SUCCESS') { console.log(`  ✅ ${label} [${hash.slice(0, 10)}...]`); return; }
    if (info.status === 'FAILED')  { throw new Error(`${label} FAILED [${hash}]`); }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`${label} timed out`);
}

async function processContract(name, contractId) {
  console.log(`\n🔧  ${name}\n    ${contractId}`);

  const instanceKey  = instanceLedgerKey(contractId);
  const latestLedger = (await server.getLatestLedger()).sequence;
  const ledgerRes    = await server.getLedgerEntries(instanceKey);

  if (!ledgerRes.entries || ledgerRes.entries.length === 0) {
    console.log('  ⚠️  Not found on ledger — maybe redeployment needed?');
    return;
  }

  const liveUntil = ledgerRes.entries[0].liveUntilLedgerSeq;
  const expired   = liveUntil < latestLedger;
  console.log(`  Live until: ${liveUntil} | Now: ${latestLedger} | ${expired ? '❌ ARCHIVED' : '✅ LIVE'}`);

  // ── RESTORE (if archived) ────────────────────────────────────
  if (expired) {
    console.log('  🔁 Restoring archived entry...');
    const account = await server.getAccount(keypair.publicKey());

    // Build restore tx with proper SorobanDataBuilder
    const restoreData = new SorobanDataBuilder()
      .setFootprint([instanceKey], [])   // readOnly=[], readWrite=[instanceKey] — wrong param order, let's check
      .build();

    // SorobanDataBuilder API: setReadOnly / setReadWrite
    const restoreDataCorrect = new SorobanDataBuilder()
      .setReadOnly([])
      .setReadWrite([instanceKey])
      .build();

    const restoreTx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: passphrase,
    })
      .setSorobanData(restoreDataCorrect)
      .addOperation(Operation.restoreFootprint({}))
      .setTimeout(TimeoutInfinite)
      .build();

    const simRestore = await server.simulateTransaction(restoreTx);
    if (!rpc.Api.isSimulationSuccess(simRestore)) {
      throw new Error(`Restore sim failed: ${simRestore.error}`);
    }

    const prepRestore = rpc.assembleTransaction(restoreTx, simRestore).build();
    prepRestore.sign(keypair);
    const resp = await server.sendTransaction(prepRestore);
    if (resp.status === 'ERROR') throw new Error(`Send error: ${resp.errorResultXdr}`);
    await waitTx(resp.hash, 'Restore');
    await new Promise(r => setTimeout(r, 4000));
  }

  // ── EXTEND TTL ────────────────────────────────────────────────
  console.log('  ⏩ Extending TTL to 1,000,000 ledgers...');
  const freshAccount = await server.getAccount(keypair.publicKey());

  const extendData = new SorobanDataBuilder()
    .setReadOnly([instanceKey])
    .setReadWrite([])
    .build();

  const extendTx = new TransactionBuilder(freshAccount, {
    fee: '1000000',
    networkPassphrase: passphrase,
  })
    .setSorobanData(extendData)
    .addOperation(Operation.extendFootprintTtl({ extendTo: 1_000_000 }))
    .setTimeout(TimeoutInfinite)
    .build();

  const simExt = await server.simulateTransaction(extendTx);
  if (!rpc.Api.isSimulationSuccess(simExt)) {
    console.warn(`  ⚠️  Extend sim failed: ${simExt.error}`);
    return;
  }

  const prepExt = rpc.assembleTransaction(extendTx, simExt).build();
  prepExt.sign(keypair);
  const respExt = await server.sendTransaction(prepExt);
  if (respExt.status === 'ERROR') throw new Error(`Extend send error: ${respExt.errorResultXdr}`);
  await waitTx(respExt.hash, 'Extend TTL');

  console.log(`  ✅ ${name} now LIVE for ~1,000,000 ledgers!`);
}

async function main() {
  console.log('=================================================');
  console.log('🚀 ANCHORVAULT — CONTRACT RESTORE & TTL EXTENDER');
  console.log(`   Deployer: ${keypair.publicKey()}`);
  console.log('=================================================');

  for (const { name, id } of CONTRACTS) {
    if (!id) { console.log(`\n⚠️  Skipping ${name} — not in .env`); continue; }
    try {
      await processContract(name, id);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  console.log('\n=================================================');
  console.log('Verifying final status...');
  console.log('=================================================');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
