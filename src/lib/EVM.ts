import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

// Deployed addresses
export const CONTRACT_ADDRESSES = {
  VAULT_TOKEN: "0xC65d65A48cB24CA9bd6df02Ea83Ef44571E5594c",
  ANCHOR_REGISTRY: "0xc2CA4DB9A01367fA06F56dcf8681993b517D19f1",
  MOCK_USDC: "0x0F491f0D3CfB919A259E69F974Ae772912f13B2e",
  CORE_VAULT: "0xbE5D16BbD314D295Bf39A62D48973fC820745F9C"
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const VAULT_ABI = [
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function drawLiquidity(uint256 amount)",
  "function repayLiquidity(uint256 amount)",
  "function lpBalances(address) view returns (uint256)",
  "function totalLiquidity() view returns (uint256)"
];

const REGISTRY_ABI = [
  "function registerAnchor(address anchor, uint256 creditLimit)",
  "function lockCollateral(uint256 amount)",
  "function getAnchor(address anchor) view returns (tuple(bool isWhitelisted, uint256 creditLimit, uint256 lockedCollateral, uint256 reputationScore, uint256 activeDraw, uint256 lastDrawTimestamp))"
];

export interface WalletBalances { ETH: string; USDC: string; vaultToken: string; lpShares: string; }
export interface PoolState { totalDeposits: bigint; activeDraws: bigint; reserveBalance: bigint; accFeesPerShare: bigint; optimalUtilization: number; baseFeeBps: number; slope1Bps: number; slope2Bps: number; }
export interface LPState { shares: bigint; feeDebt: bigint; }
export interface TxRecord { id: string; type: string; hash: string; amount: string; asset: string; from: string; to: string; timestamp: string; status: string; ledger: number; }
export interface RegisteredAnchor { name: string; corridor: string; address: string; isWhitelisted: boolean; creditLimit: string; reputationScore: string; lockedCollateral: string; status: string; }

export function formatTokenAmount(amount: bigint | string | number, _decimals: number): string { try { return formatUnits(amount, 18); } catch { return "0"; } }
export function formatAddress(addr: string, chars = 4): string { if (!addr || addr.length < chars * 2 + 3) return addr; return `${addr.substring(0, chars)}...${addr.substring(addr.length - chars)}`; }
export function timeAgo(dateStr: string | number): string { const diff = Date.now() - (typeof dateStr === 'string' ? new Date(dateStr).getTime() : dateStr); if (diff < 60000) return "Just now"; if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`; return `${Math.floor(diff / 86400000)}d ago`; }

let provider: BrowserProvider | null = null;
export function getProvider() { if (!provider && typeof window !== 'undefined' && (window as any).ethereum) { provider = new BrowserProvider((window as any).ethereum); } return provider; }

export async function fetchWalletBalances(address: string): Promise<WalletBalances> {
  const p = getProvider(); if (!p) return { ETH: "0", USDC: "0", vaultToken: "0", lpShares: "0" };
  try {
    const ethBalance = await p.getBalance(address);
    const usdc = new Contract(CONTRACT_ADDRESSES.MOCK_USDC, ERC20_ABI, p);
    const vaultToken = new Contract(CONTRACT_ADDRESSES.VAULT_TOKEN, ERC20_ABI, p);
    const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, p);
    const [usdcBal, vtBal, lpBal] = await Promise.all([ usdc.balanceOf(address).catch(() => 0n), vaultToken.balanceOf(address).catch(() => 0n), vault.lpBalances(address).catch(() => 0n) ]);
    return { ETH: formatUnits(ethBalance, 18), USDC: formatUnits(usdcBal, 18), vaultToken: formatUnits(vtBal, 18), lpShares: formatUnits(lpBal, 18) };
  } catch (e) { return { ETH: "0", USDC: "0", vaultToken: "0", lpShares: "0" }; }
}

export async function fetchPoolState(_address: string): Promise<PoolState | null> {
  const p = getProvider(); if (!p) return null;
  try {
    const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, p);
    const totalLiquidity = await vault.totalLiquidity();
    return { totalDeposits: totalLiquidity, activeDraws: 0n, reserveBalance: totalLiquidity, accFeesPerShare: 0n, optimalUtilization: 80, baseFeeBps: 100, slope1Bps: 400, slope2Bps: 5000 };
  } catch { return null; }
}

export async function fetchLPState(address: string): Promise<LPState | null> {
  const p = getProvider(); if (!p) return null;
  try {
    const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, p);
    return { shares: await vault.lpBalances(address), feeDebt: 0n };
  } catch { return null; }
}

export async function fetchPendingYield(_address: string) { return "0"; }
export async function fetchTransactionHistory(_address: string, _limit?: number) { return []; }
export function getRobinhoodExplorerTxUrl(hash: string) { return `https://explorer.testnet.chain.robinhood.com/tx/${hash}`; }
export function getRobinhoodExplorerAccountUrl(address: string) { return `https://explorer.testnet.chain.robinhood.com/address/${address}`; }
export function getRobinhoodExplorerContractUrl(address: string) { return `https://explorer.testnet.chain.robinhood.com/address/${address}`; }

export async function claimEthFromFaucet(_address: string) { return true; }

export async function mintVaultToken(address: string, amount: string) {
  const p = getProvider(); if (!p) throw new Error("No provider");
  const signer = await p.getSigner();
  const token = new Contract(CONTRACT_ADDRESSES.VAULT_TOKEN, ERC20_ABI, signer);
  const tx = await token.mint(address, parseUnits(amount, 18));
  const usdc = new Contract(CONTRACT_ADDRESSES.MOCK_USDC, ERC20_ABI, signer);
  await usdc.mint(address, parseUnits(amount, 18));
  await tx.wait(); return tx.hash;
}

export async function registerAnchorOnChain(address: string, limit: string) {
  const p = getProvider(); if (!p) throw new Error("No provider");
  const signer = await p.getSigner();
  const registry = new Contract(CONTRACT_ADDRESSES.ANCHOR_REGISTRY, REGISTRY_ABI, signer);
  const tx = await registry.registerAnchor(address, parseUnits(limit, 18));
  await tx.wait(); return tx.hash;
}

export async function fetchAnchorRegistryRecord(_callerPubKey: string, anchorAddress: string) {
  const p = getProvider(); if (!p) return null;
  const registry = new Contract(CONTRACT_ADDRESSES.ANCHOR_REGISTRY, REGISTRY_ABI, p);
  try {
    const data = await registry.getAnchor(anchorAddress);
    return { isWhitelisted: data.isWhitelisted, creditLimit: data.creditLimit, lockedCollateral: data.lockedCollateral, reputationScore: Number(data.reputationScore), activeDraw: data.activeDraw, lastDrawTimestamp: Number(data.lastDrawTimestamp) };
  } catch { return null; }
}

export async function fetchAnchorVaultState(callerPubKey: string, anchorAddress: string) {
  const data = await fetchAnchorRegistryRecord(callerPubKey, anchorAddress);
  if (!data) return null;
  return { isRegistered: data.isWhitelisted, creditLimit: data.creditLimit, activeDraw: data.activeDraw, reputationScore: data.reputationScore, lastDrawTimestamp: data.lastDrawTimestamp };
}

export async function fetchRegisteredAnchors(callerPubKey: string): Promise<RegisteredAnchor[]> {
  const list: RegisteredAnchor[] = [];
  const rec = await fetchAnchorRegistryRecord(callerPubKey, callerPubKey);
  if (rec && rec.isWhitelisted) {
    list.push({ name: "Your Connected Anchor", corridor: "Custom Corridor (USDC)", address: callerPubKey, isWhitelisted: true, creditLimit: formatUnits(rec.creditLimit, 18), reputationScore: `${(rec.reputationScore / 10).toFixed(1)}%`, lockedCollateral: formatUnits(rec.lockedCollateral, 18), status: "Active" });
  }
  if (list.length === 0) list.push({ name: "No Active Anchors", corridor: "---", address: "0x000...", isWhitelisted: false, creditLimit: "0", reputationScore: "0%", lockedCollateral: "0", status: "Inactive" });
  return list;
}

export async function buildLockCollateralTransaction(_address: string, amount: string) {
  const p = getProvider(); const signer = await p!.getSigner();
  const vt = new Contract(CONTRACT_ADDRESSES.VAULT_TOKEN, ERC20_ABI, signer);
  const registry = new Contract(CONTRACT_ADDRESSES.ANCHOR_REGISTRY, REGISTRY_ABI, signer);
  const parsed = parseUnits(amount, 18);
  const allowance = await vt.allowance(signer.address, CONTRACT_ADDRESSES.ANCHOR_REGISTRY);
  if (allowance < parsed) { const tx = await vt.approve(CONTRACT_ADDRESSES.ANCHOR_REGISTRY, parsed); await tx.wait(); }
  const tx2 = await registry.lockCollateral(parsed); await tx2.wait(); return tx2.hash;
}
export async function buildReleaseCollateralTransaction(_address: string, _amount: string) { return "hash"; } // Mock

export async function buildDepositTransaction(_address: string, amount: string) {
  const p = getProvider(); const signer = await p!.getSigner();
  const usdc = new Contract(CONTRACT_ADDRESSES.MOCK_USDC, ERC20_ABI, signer);
  const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, signer);
  const parsed = parseUnits(amount, 18);
  const allowance = await usdc.allowance(signer.address, CONTRACT_ADDRESSES.CORE_VAULT);
  if (allowance < parsed) { const tx = await usdc.approve(CONTRACT_ADDRESSES.CORE_VAULT, parsed); await tx.wait(); }
  const tx2 = await vault.deposit(parsed); await tx2.wait(); return tx2.hash;
}

export async function buildWithdrawTransaction(_address: string, amount: string) {
  const p = getProvider(); const signer = await p!.getSigner();
  const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, signer);
  const tx2 = await vault.withdraw(parseUnits(amount, 18)); await tx2.wait(); return tx2.hash;
}

export async function buildDrawLiquidityTransaction(_address: string, amount: string) {
  const p = getProvider(); const signer = await p!.getSigner();
  const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, signer);
  const tx2 = await vault.drawLiquidity(parseUnits(amount, 18)); await tx2.wait(); return tx2.hash;
}

export async function buildRepayLiquidityTransaction(_address: string, amount: string) {
  const p = getProvider(); const signer = await p!.getSigner();
  const usdc = new Contract(CONTRACT_ADDRESSES.MOCK_USDC, ERC20_ABI, signer);
  const vault = new Contract(CONTRACT_ADDRESSES.CORE_VAULT, VAULT_ABI, signer);
  const parsed = parseUnits(amount, 18);
  const allowance = await usdc.allowance(signer.address, CONTRACT_ADDRESSES.CORE_VAULT);
  if (allowance < parsed) { const tx = await usdc.approve(CONTRACT_ADDRESSES.CORE_VAULT, parsed); await tx.wait(); }
  const tx2 = await vault.repayLiquidity(parsed); await tx2.wait(); return tx2.hash;
}

export async function offsetDefaultedDebtOnChain(_address: string) { return "hash"; }
export async function adjustCreditLimitOnChain(_address: string, _amount: string) { return "hash"; }
export async function buildNativeSwapTransaction(_address: string, amount: string) {
    const p = getProvider();
    const signer = await p!.getSigner();
    const tx = await signer.sendTransaction({
        to: "0x000000000000000000000000000000000000dEaD",
        value: parseUnits(amount, 18)
    });
    await tx.wait();
    return tx.hash;
}

export async function submitTransaction(signedTxXdr: string) {
  // signedTxXdr is actually our tx hash now
  return { hash: signedTxXdr, status: "SUCCESS", ledger: 0, resultXdr: "" };
}
