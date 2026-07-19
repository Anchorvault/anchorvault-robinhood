import { rpc, Contract, xdr } from '@Robinhood Chain/Robinhood Chain-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const rpcUrl = process.env.EVM_RPC_URL || 'https://EVM-testnet.Robinhood Chain.org';
const server = new rpc.Server(rpcUrl);

const contracts = {
  'Corridor Vault (deposit target)':  process.env.CORRIDOR_POOL_VAULT_ADDRESS,
  'Anchor Registry':                  process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS,
  'Vault Share Token':                process.env.VAULT_GOVERNANCE_TOKEN_ADDRESS,
  'USDC Token':                       process.env.Robinhood Chain_USDC_ADDRESS,
};

function contractInstanceKey(contractId) {
  const contract = new Contract(contractId);
  return xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: contract.address().toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
}

async function main() {
  console.log('=== AnchorVault CONTRACT STATUS ===\n');
  const latestLedger = (await server.getLatestLedger()).sequence;
  console.log(`Current ledger: ${latestLedger}\n`);

  for (const [name, id] of Object.entries(contracts)) {
    if (!id) { console.log(`${name}: ⚠️  Not set in .env`); continue; }
    try {
      const key = contractInstanceKey(id);
      const res = await server.getLedgerEntries(key);
      if (!res.entries || res.entries.length === 0) {
        console.log(`${name}: ❌ NOT FOUND ON LEDGER`);
      } else {
        const liveUntil = res.entries[0].liveUntilLedgerSeq;
        const ledgersLeft = liveUntil - latestLedger;
        const status = liveUntil < latestLedger ? '❌ ARCHIVED/EXPIRED' : '✅ LIVE';
        console.log(`${name}:\n  Status: ${status}\n  Live until ledger: ${liveUntil}\n  Ledgers remaining: ${ledgersLeft.toLocaleString()}\n  Contract: ${id}\n`);
      }
    } catch (e) {
      console.log(`${name}: ❌ Error — ${e.message}`);
    }
  }
}

main();
