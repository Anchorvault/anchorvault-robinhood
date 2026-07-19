/**
 * Restores archived EVM contracts using simulate-then-submit approach.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import {
  rpc,
  Keypair,
  TransactionBuilder,
  TimeoutInfinite,
  Operation,
  Contract,
  xdr,
} from '@Robinhood Chain/Robinhood Chain-sdk';

const rpcUrl     = process.env.EVM_RPC_URL || 'https://EVM-testnet.Robinhood Chain.org';
const passphrase = process.env.Robinhood Chain_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const secretKey  = process.env.DEPLOYER_SECRET_KEY;
const server     = new rpc.Server(rpcUrl);
const keypair    = Keypair.fromSecret(secretKey);

// All contracts to restore + extend
const CONTRACTS = [
  { name: 'USDC Token',          id: process.env.Robinhood Chain_USDC_ADDRESS },
  { name: 'Vault Share Token',   id: process.env.VAULT_GOVERNANCE_TOKEN_ADDRESS },
  { name: 'Anchor Registry',     id: process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS },
  { name: 'Corridor Vault',      id: process.env.CORRIDOR_POOL_VAULT_ADDRESS },
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
    if (info.status === 'SUCCESS') { console.log(`  ✅ ${label} OK  [${hash.slice(0,12)}...]`); return; }
    if (info.status === 'FAILED')  { throw new Error(`${label} FAILED [${hash}]`); }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`${label} timed out`);
}

async function process(name, contractId) {
  console.log(`\n🔧  ${name} (${contractId.slice(0,8)}...)`);

  const instanceKey  = instanceLedgerKey(contractId);
  const latestLedger = (await server.getLatestLedger()).sequence;
  const ledgerRes    = await server.getLedgerEntries(instanceKey);

  if (!ledgerRes.entries || ledgerRes.entries.length === 0) {
    console.log('  ⚠️  Not found on ledger — skipping.');
    return;
  }

  const liveUntil = ledgerRes.entries[0].liveUntilLedgerSeq;
  const expired   = liveUntil < latestLedger;
  console.log(`  Live until: ${liveUntil} | Now: ${latestLedger} | ${expired ? '❌ ARCHIVED' : '✅ LIVE'}`);

  const account = await server.getAccount(keypair.publicKey());

  // ── RESTORE (if archived) ──────────────────────────────────────
  if (expired) {
    console.log('  ⛔ Restoring archived entry...');

    // Dummy restore tx — let simulateTransaction fill in the correct footprint
    const dummyRestore = new TransactionBuilder(account, {
      fee: '500000',
      networkPassphrase: passphrase,
    })
      .addOperation(Operation.restoreFootprint({}))
      .setTimeout(TimeoutInfinite)
      .build();

    // Inject the footprint manually into EVM data
    const EVMData = new xdr.EVMTransactionData({
      resources: new xdr.EVMResources({
        footprint: new xdr.LedgerFootprint({
          readOnly: [],
          readWrite: [instanceKey],
        }),
        instructions: 500000,
        readBytes: 10000,
        writeBytes: 10000,
      }),
      resourceFee: xdr.Int64.fromString('100000'),
      ext: new xdr.ExtensionPoint(0),
    });
    dummyRestore.operations[0] = dummyRestore.operations[0]; // no-op, just to keep ref

    // Build proper restore tx
    const restoreTx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: passphrase,
    })
      .addOperation(Operation.restoreFootprint({}))
      .setTimeout(TimeoutInfinite)
      .build();

    // Use simulateTransaction to get proper EVM data
    restoreTx.toEnvelope().v1().tx().ext(
      new xdr.TransactionExt(1, EVMData)
    );

    const sim = await server.simulateTransaction(restoreTx);
    if (!rpc.Api.isSimulationSuccess(sim)) {
      console.warn(`  ⚠️  Sim failed: ${sim.error || JSON.stringify(sim)} — trying forced assembly...`);
    }

    const prepared = rpc.assembleTransaction(restoreTx, sim).build();
    prepared.sign(keypair);
    const resp = await server.sendTransaction(prepared);
    if (resp.status === 'ERROR') throw new Error(`Send error: ${resp.errorResultXdr}`);
    await waitTx(resp.hash, 'Restore');

    // Refresh account for next tx
    await new Promise(r => setTimeout(r, 3000));
  }

  // ── EXTEND TTL ─────────────────────────────────────────────────
  console.log('  ⏩  Extending TTL...');
  const freshAccount = await server.getAccount(keypair.publicKey());

  const extendData = new xdr.EVMTransactionData({
    resources: new xdr.EVMResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [instanceKey],
        readWrite: [],
      }),
      instructions: 100000,
      readBytes: 10000,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('100000'),
    ext: new xdr.ExtensionPoint(0),
  });

  const extendTx = new TransactionBuilder(freshAccount, {
    fee: '1000000',
    networkPassphrase: passphrase,
  })
    .addOperation(Operation.extendFootprintTtl({ extendTo: 1_000_000 }))
    .setTimeout(TimeoutInfinite)
    .build();

  extendTx.toEnvelope().v1().tx().ext(
    new xdr.TransactionExt(1, extendData)
  );

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

  console.log(`  ✅ ${name} is now LIVE for ~1,000,000 ledgers!`);
}

async function main() {
  console.log('================================================');
  console.log('🚀  AnchorVault — FULL CONTRACT RESTORE SCRIPT');
  console.log(`    Deployer: ${keypair.publicKey()}`);
  console.log('================================================');

  for (const { name, id } of CONTRACTS) {
    if (!id) { console.log(`\n⚠️  Skipping ${name} — not set in .env`); continue; }
    try {
      await process(name, id);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n================================================');
  console.log('🎉 DONE — Run check_status.js to verify');
  console.log('================================================');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
