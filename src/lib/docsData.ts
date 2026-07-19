import { 
  BookOpen, Rocket, Workflow, Waves, Users, 
  Building2, LineChart, ShieldCheck, Flame, 
  Terminal, Code2, Cpu, Key, FolderOpen, 
  Hammer, Globe, Wrench, ShieldAlert, BadgeAlert,
  Server, Coins
} from 'lucide-react';

export interface DocPage {
  id: string;
  title: string;
  sidebarTitle: string;
  description: string;
  category: string;
  icon: any;
  content: {
    type: 'rich' | 'api' | 'guide';
    sections: Array<{
      title?: string;
      subtitle?: string;
      text?: string;
      bulletPoints?: string[];
      infoCallout?: { title: string; text: string };
      warningCallout?: { title: string; text: string };
      tipCallout?: { title: string; text: string };
      steps?: Array<{ title: string; desc: string }>;
      cards?: Array<{ title: string; desc: string; icon: string; link?: string }>;
      codeBlock?: { language: string; filename?: string; code: string };
      codeGroup?: Array<{ label: string; language: string; code: string }>;
      accordion?: Array<{ title: string; content: string }>;
      table?: {
        headers: string[];
        rows: string[][];
      };
    }>;
  };
}

export const DOCS_PAGES: DocPage[] = [
  // -------------------------------------------------------------
  // GETTING STARTED
  // -------------------------------------------------------------
  {
    id: "introduction",
    title: "Welcome to AnchorVault",
    sidebarTitle: "Introduction",
    description: "AnchorVault is a trustless, on-chain remittance liquidity routing protocol built on Robinhood Chain EVM.",
    category: "Getting Started",
    icon: BookOpen,
    content: {
      type: "rich",
      sections: [
        {
          infoCallout: {
            title: "Robinhood Chain Mainnet Deployed",
            text: "AnchorVault is currently live on the Robinhood Chain Mainnet. Multi-corridor testing is fully operational."
          },
          text: "AnchorVault is a production-grade, decentralized liquidity protocol designed to bridge Liquidity Providers (LPs) with authorized off-ramp payment anchors to facilitate instant, cross-border payments. By locking stablecoins in corridor pools, LPs earn organic yield from actual remittance settlements."
        },
        {
          title: "Why AnchorVault?",
          text: "Traditional remittance channels rely on fragmented liquidity pools and slow pre-funding arrangements. AnchorVault solves this by providing a unified, trustless liquidity layer:",
          cards: [
            { title: "Instant Settlements", desc: "Anchors draw pooled USDC to settle cash-outs in seconds instead of days.", icon: "bolt" },
            { title: "Organic Yield for LPs", desc: "LPs earn interest strictly from active corridor utilization, not artificial token mints.", icon: "trending-up" },
            { title: "Trustless EVM Security", desc: "All state logic is fully governed on-chain by Rust smart contracts.", icon: "lock" },
            { title: "Dynamic Risk Control", desc: "Dynamic fee rates based on pool utilization protect LPs and manage risk.", icon: "shield" }
          ]
        },
        {
          title: "Protocol Lifecycle",
          text: "The operational flow involves three main coordinates working in sync:",
          steps: [
            { title: "Liquidity Provisioning", desc: "LPs deposit USDC into the Corridor Pool Vault. They receive $AVLT tokens representing their pool ownership shares." },
            { title: "Staking & Whitelisting", desc: "Payment anchors register on-chain and lock $AVLT tokens as collateral inside the Anchor Registry to unlock a credit line." },
            { title: "USDC Drawdowns", desc: "When a remittance is initiated, anchors draw USDC from the vault to satisfy cash-out corridors immediately." },
            { title: "Corridor Repayment", desc: "Anchors repay outstanding USDC draws back to the vault plus a utilization-based dynamic fee." }
          ]
        }
      ]
    }
  },
  {
    id: "quickstart",
    title: "Quickstart Guide",
    sidebarTitle: "Quickstart",
    description: "Deploy contracts, initialize pool parameters, and start running the DeFi portal locally.",
    category: "Getting Started",
    icon: Rocket,
    content: {
      type: "rich",
      sections: [
        {
          text: "Follow this guide to set up your developer environment and run the complete AnchorVault protocol locally or on the Robinhood Chain Mainnet in under 10 minutes."
        },
        {
          title: "1. Prerequisites",
          text: "Ensure your machine has the following tools installed:",
          accordion: [
            { title: "Rust Toolchain", content: "Requires Rust 1.74+ and WASM compilation targets. Add with: rustup target add wasm32-unknown-unknown." },
            { title: "Robinhood Chain EVM CLI", content: "Install the CLI to deploy and manage contracts: cargo install --locked EVM-cli." },
            { title: "Node.js (v18+)", content: "Used to run keys management, setup, and the high-fidelity Vite frontend dashboard." }
          ]
        },
        {
          title: "2. Clone & Setup",
          text: "Clone the code and install standard package dependencies:",
          codeBlock: {
            language: "bash",
            filename: "Terminal",
            code: "git clone https://github.com/shriyashsoni/AnchorVault.git\ncd AnchorVault\nnpm install"
          }
        },
        {
          title: "3. Generate and Fund Mainnet Keys",
          text: "Generate secure keys and fund them with 10k mainnet XLM via Robinhood Chain Friendbot:",
          codeBlock: {
            language: "bash",
            filename: "Terminal",
            code: "node setup_keys.js"
          },
          infoCallout: {
            title: "Auto-Configured Keys",
            text: "This script automatically generates key pairs and writes the variables securely into a local .env file."
          }
        },
        {
          title: "4. Compile and Optimize Rust WASM",
          text: "Compile the modular Rust crates to standard 32-bit WASM outputs and optimize the target sizes to stay within EVM limits:",
          codeBlock: {
            language: "bash",
            filename: "Terminal",
            code: "cargo build --target wasm32-unknown-unknown --release\nRobinhood Chain contract optimize --wasm target/wasm32-unknown-unknown/release/anchor_vault.wasm"
          }
        },
        {
          title: "5. Deploy & Run Local UI",
          text: "Deploy the smart contracts, initialize pool connections, and boot the gorgeous obsidian-glass styled frontend interface:",
          codeBlock: {
            language: "bash",
            filename: "Terminal",
            code: "npm run deploy\nnpm run initialize\nnpm run dev"
          },
          tipCallout: {
            title: "Local Port",
            text: "Open http://localhost:5173/ in your browser, connect Freighter, and start routing stablecoins!"
          }
        }
      ]
    }
  },
  {
    id: "architecture",
    title: "System Architecture",
    sidebarTitle: "Architecture",
    description: "Deep dive into AnchorVault's protocol architecture, smart contract relationships, and storage schemas.",
    category: "Getting Started",
    icon: Workflow,
    content: {
      type: "rich",
      sections: [
        {
          text: "AnchorVault operates as a trustless, modular state machine on Robinhood Chain. It consists of four distinct on-chain coordinates designed to maintain system health, manage LPs, whitelist anchors, and handle yield math."
        },
        {
          title: "Live Mainnet Smart Contract Addresses",
          text: "All AnchorVault contracts are deployed and verified on the Robinhood Chain Mainnet. Click any address to verify on Robinhood Explorer.",
          table: {
            headers: ["Contract", "Mainnet Address", "Role"],
            rows: [
              ["USDC Stablecoin (SAC)", "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75", "Core reserve asset for corridor pools"],
              ["Vault Share Token ($AVLT)", "CDXELK3CF4GHCK6U3NETR2NNONDV3VDNKM7MT4QD5M23AHRN5X47O4IF", "LP share tokens minted on deposit"],
              ["Anchor Registry", "CA6NMU2ADEKVTS4XBZRLAARH7VSF7JEKWKAHNVT7WE5ZIEEKKOCOM6QO", "Whitelisting, reputation, and collateral stakes"],
              ["Corridor Pool Vault", "CDO3GSX27G6TAHLBROCC6WV4TNM6BWLFZDT2OW6RSUVBSGZJKTIISJFG", "Deposits, draws, repayments, and yield routing"]
            ]
          },
          infoCallout: {
            title: "Verify On-Chain",
            text: "All contract addresses can be independently verified at Robinhood Chain.expert/explorer/public/contract/{address}"
          }
        },
        {
          title: "Protocol Architecture Flow",
          text: "AnchorVault coordinates three distinct entities trustlessly on-chain — Liquidity Providers, Payment Anchors, and the Core Smart Contracts. The high-level interaction flow operates as follows:",
          bulletPoints: [
            "Step 1 — LP Deposits USDC: A Liquidity Provider deposits USDC stablecoins into the Corridor Pool Vault contract.",
            "Step 2 — Vault Mints $AVLT Shares: The Vault calculates the LP's proportional ownership and mints $AVLT share tokens back to the LP.",
            "Step 3 — Anchor Registers & Stakes: A Payment Anchor registers on-chain through the Anchor Registry and locks $AVLT tokens as collateral to unlock a credit line.",
            "Step 4 — Anchor Draws Settlement USDC: The whitelisted anchor draws USDC from the vault to fulfill an immediate off-ramp cash-out in a global corridor.",
            "Step 5 — Corridor Payout Settled: The anchor completes the real-world remittance settlement using the drawn USDC.",
            "Step 6 — Anchor Repays USDC + Fee: The anchor repays the principal USDC plus a dynamic utilization-based fee back into the vault.",
            "Step 7 — Yield Distributed to LPs: The vault updates acc_fees_per_share — 90% of fees go to LPs, 5% to the Insurance Fund."
          ]
        },
        {
          title: "Detailed LP & Anchor Operational Lifecycle",
          text: "The complete transaction lifecycle involves precise on-chain interactions between all four smart contracts:",
          accordion: [
            { title: "Phase 1: Liquidity Provisioning (Deposit)", content: "The LP calls deposit(lp_address, amount) on the Corridor Pool Vault. The Vault transfers USDC from the LP to itself via the USDC SAC contract, calculates LP shares based on the current reserve asset ratio, then calls mint(lp_address, share_amount) on the Vault Share Token contract. The LP receives $AVLT tokens representing their pool ownership." },
            { title: "Phase 2: Anchor Staking & Whitelisting", content: "The Payment Anchor calls lock_collateral(amount) on the Anchor Registry. The Registry transfers $AVLT tokens from the anchor into its own custody via the Vault Token contract, then activates the anchor's whitelist status and applies a reputation boost. The anchor is now authorized to draw liquidity." },
            { title: "Phase 3: Liquidity Routing (Draw Phase)", content: "The anchor calls draw_liquidity(anchor_address, amount_usdc) on the Corridor Vault. The Vault first checks the Registry to assert is_whitelisted(anchor_address), then verifies that active_draw + amount <= credit_limit. If both checks pass, USDC is transferred from the vault to the anchor. The anchor then fulfills the remittance payout off-chain." },
            { title: "Phase 4: Repayment & LP Yield Accrual", content: "The anchor calls repay_liquidity(anchor_address, principal_amount) on the Vault. The Vault computes the current pool utilization via calculate_utilization(), then applies the Two-Slope fee curve via calculate_fee_rate(). USDC (principal + fee) is transferred from the anchor back to the vault. The Registry updates the anchor's reputation score. Finally, the vault distributes yield: 90% to acc_fees_per_share (for LPs) and 5% to the Insurance Fund." }
          ]
        },
        {
          title: "Smart Contract Topology",
          text: "The contracts are decoupled to isolate risk and support upgradability:",
          bulletPoints: [
            "USDC Stablecoin: The underlying capital reserve. Governed by Robinhood Chain's official Robinhood Chain Asset Contract (SAC) — Circle's native USDC on Mainnet.",
            "Vault Share Token ($AVLT): Represents fractional pool ownership for Liquidity Providers. Only the Corridor Vault has mint/burn authority.",
            "Corridor Pool Vault: The primary coordinator. Manages reserves, processes draws, repays, calculates dynamic fees, and distributes yield.",
            "Anchor Registry: The whitelisting and reputation node. Manages anchor stakes, credit lines, reputation scoring, and slashed collateral routing."
          ]
        },
        {
          title: "Storage Architecture",
          text: "All contracts leverage EVM's dual-storage patterns (Instance vs. Persistent) to optimize storage fees:",
          table: {
            headers: ["Storage Type", "Key Coordinate", "Data Maintained"],
            rows: [
              ["Instance (Shared)", "PoolState", "Deposits, active draws, reserve balances, dynamic fee parameters"],
              ["Instance (Shared)", "InsuranceFund", "Safety capital reserves accumulated from 5% of settlement fees"],
              ["Persistent (Siloed)", "LPState(Address)", "LP share tokens owned, accumulated fee debt metrics"],
              ["Persistent (Siloed)", "AnchorState(Address)", "Outstanding draws, maximum credit lines, active reputation score"]
            ]
          }
        },
        {
          title: "Fee Model Parameters (Deployed On-Chain)",
          text: "The Corridor Vault is initialized with the following Two-Slope Utilization Curve parameters that govern dynamic borrowing costs:",
          table: {
            headers: ["Parameter", "Value", "Basis Points"],
            rows: [
              ["Optimal Utilization (U_optimal)", "80.00%", "8000 bps"],
              ["Base Fee Rate (R_base)", "1.00%", "100 bps"],
              ["Slope 1 Rate (R_slope1)", "4.00%", "400 bps"],
              ["Slope 2 Penalty Rate (R_slope2)", "50.00%", "5000 bps"]
            ]
          },
          warningCallout: {
            title: "Penalty Zone",
            text: "When pool utilization exceeds 80%, the fee rate scales aggressively from 5% up to 55%, strongly incentivizing anchors to repay and restore pool liquidity."
          }
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // CORE CONCEPTS
  // -------------------------------------------------------------
  {
    id: "concepts/corridor-pools",
    title: "Corridor Pools & Reserves",
    sidebarTitle: "Corridor Pools",
    description: "Understand how corridor pools manage pre-funded stablecoins to support off-ramp corridors.",
    category: "Core Concepts",
    icon: Waves,
    content: {
      type: "rich",
      sections: [
        {
          text: "Corridor Pools are pre-funded USDC reserves held securely within the Vault smart contract. They enable payment anchors to draw immediate settlement cash while protecting Liquidity Providers through programmatic mathematical guarantees."
        },
        {
          title: "Dynamic Reserve Accounting",
          text: "The total value of a corridor pool is the sum of idle reserves and outstanding anchor draws. This represents the total pool valuation used to calculate the share price:",
          warningCallout: {
            title: "Utilization & Withdrawals",
            text: "If pool utilization is extremely high, withdrawals may temporarily revert until anchors make repayments to ensure sufficient reserve liquidity."
          }
        },
        {
          title: "Math Proof: LP Share Pricing",
          text: "To ensure absolute fairness, LP shares ($AVLT) are minted and burned dynamically in fixed-point space according to pool reserves:",
          codeBlock: {
            language: "rust",
            code: "// LP Shares minted on deposit:\nshares = (deposit_amount * total_shares) / total_pool_reserves\n\n// Payout on share burning:\nwithdraw_amount = (burned_shares * total_pool_reserves) / total_shares"
          }
        }
      ]
    }
  },
  {
    id: "concepts/liquidity-providers",
    title: "Liquidity Providers & Yield Mechanics",
    sidebarTitle: "Liquidity Providers",
    description: "How LPs deposit stablecoins, claim real-world yield, and receive vault share tokens.",
    category: "Core Concepts",
    icon: Users,
    content: {
      type: "rich",
      sections: [
        {
          text: "Liquidity Providers (LPs) supply the USDC capital that fuels the AnchorVault protocol. In exchange, they receive $AVLT (Vault Share Token) representing their proportional share of pool capital."
        },
        {
          title: "Organic Yield Generation",
          text: "Unlike inflationary protocols that mint speculative tokens to reward users, AnchorVault distributes organic yield from real transaction utility. When payment anchors repay their draws, a fee is added to the pool reserves.",
          bulletPoints: [
            "90% of all accumulated fees are directly allocated to LPs.",
            "Yield is tracked via a high-precision accumulator (acc_fees_per_share) scaled to 1e12.",
            "LPs auto-claim their share of accrued yield whenever they deposit or withdraw."
          ]
        }
      ]
    }
  },
  {
    id: "concepts/payment-anchors",
    title: "Payment Anchors & Collateralization",
    sidebarTitle: "Payment Anchors",
    description: "How payment anchors register, lock collateral, and draw settlement lines.",
    category: "Core Concepts",
    icon: Building2,
    content: {
      type: "rich",
      sections: [
        {
          text: "Payment Anchors are off-ramp fiat payout channels whitelisted by the protocol to handle cross-border payments. To draw USDC for immediate cash-outs, anchors must satisfy minimum collateral constraints."
        },
        {
          title: "Staking & Credit Limits",
          text: "Anchors must stake $AVLT shares into the Anchor Registry. The system enforces a strict 10% minimum collateral-to-credit ratio (1000 basis points).",
          bulletPoints: [
            "If an anchor has a credit limit of $100,000, they must lock at least $10,000 worth of $AVLT.",
            "Credit capacity is dynamically reduced if their reputation score drops.",
            "Slashed stakes are redirected to the Insurance Fund to protect LP capital from default risks."
          ]
        }
      ]
    }
  },
  {
    id: "concepts/yield-model",
    title: "Two-Slope Utilization & Dynamic Fee Curve",
    sidebarTitle: "Yield Model",
    description: "Deep dive into AnchorVault's utilization-based dynamic borrow rate curve.",
    category: "Core Concepts",
    icon: LineChart,
    content: {
      type: "rich",
      sections: [
        {
          text: "AnchorVault manages borrow risk and protects pool liquidity using a Two-Slope Utilization Curve. This increases borrowing costs aggressively when pool reserves are heavily depleted, forcing anchors to repay outstanding lines."
        },
        {
          title: "Optimal Target and Fee Structure",
          text: "The system targets an Optimal Utilization of 80% (8000 basis points). The dynamic interest rates scale as follows:",
          bulletPoints: [
            "Below 80% Utilization: Fees increase moderately from a base of 1% (100 bps) up to 5% (500 bps).",
            "Above 80% Utilization: Penalties activate, scaling interest fees steeply up to a maximum of 55% (5500 bps) at 100% utilization."
          ],
          warningCallout: {
            title: "Dynamic Penalty System",
            text: "This curve represents a critical security barrier, ensuring anchors are highly incentivized to return capital when the pool is stressed."
          }
        },
        {
          title: "Math Formulation",
          text: "The interest rate R is computed strictly inside the EVM runtime using checked integer arithmetic:",
          codeBlock: {
            language: "rust",
            code: "if U <= U_optimal {\n    R = R_base + (U * R_slope1) / U_optimal;\n} else {\n    let excess = U - U_optimal;\n    let space = 10000 - U_optimal;\n    R = R_base + R_slope1 + (excess * R_slope2) / space;\n}"
          }
        }
      ]
    }
  },
  {
    id: "concepts/reputation-system",
    title: "On-Chain Reputation & Credit Scoring",
    sidebarTitle: "Reputation System",
    description: "Dynamic modifiers that reward timely repayments and punish default behaviors.",
    category: "Core Concepts",
    icon: ShieldCheck,
    content: {
      type: "rich",
      sections: [
        {
          text: "The Anchor Registry maintains an on-chain credit score (0 to 1000) for every registered anchor. Reputation coordinates with the dynamic fee curve to adjust borrow rates."
        },
        {
          title: "Reputation Modifiers",
          bulletPoints: [
            "Default Status: All registered anchors start with a default reputation of 800 (80%).",
            "Fee Discounts: Anchors with scores above 900 receive up to a 25% discount on settlement fees.",
            "Fee Premiums: Anchors with scores below 600 pay up to a 50% premium on settlement fees.",
            "Slashing: Defaulting on a draw or failing to repay before epoch expiration triggers a severe score slash and credit line freezes."
          ]
        }
      ]
    }
  },
  {
    id: "concepts/insurance-fund",
    title: "Bad Debt & Dynamic Insurance Fund",
    sidebarTitle: "Insurance Fund",
    description: "PROGRAMMATIC capital reserves that cushion the protocol against anchor defaults.",
    category: "Core Concepts",
    icon: Flame,
    content: {
      type: "rich",
      sections: [
        {
          text: "To protect LPs from default risks or settlement defaults, AnchorVault maintains an on-chain Insurance Fund."
        },
        {
          title: "Capital Accumulation & Claims",
          text: "The Insurance Fund is continuously funded on-chain:",
          bulletPoints: [
            "5% of all dynamic settlement fees are diverted directly into the Insurance Fund.",
            "Slashed anchor collateral (AVLT) is automatically liquidated and routed to the fund.",
            "If an anchor fails to repay after 72 hours, the protocol declares bad debt and routes USDC from the Insurance Fund to restore the pool reserve balance."
          ]
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // SMART CONTRACTS
  // -------------------------------------------------------------
  {
    id: "contracts/overview",
    title: "Smart Contracts Overview",
    sidebarTitle: "Overview",
    description: "AnchorVault's modular Rust-based smart contract stack.",
    category: "Smart Contracts",
    icon: Terminal,
    content: {
      type: "rich",
      sections: [
        {
          text: "AnchorVault smart contracts are compiled to optimized WASM binaries and run on Robinhood Chain's EVM VM. The modular design separates asset balances, risk management, and reputation metrics."
        },
        {
          title: "Contract Interfaces",
          cards: [
            { title: "Corridor Pool Vault", desc: "Coordinates USDC deposits, draws, repayments, utilization calculations, and yield distributions.", icon: "building-columns", link: "contracts/corridor-vault" },
            { title: "Anchor Registry", desc: "Whitelists anchors, locks AVLT collateral stakes, and calculates active reputation scores.", icon: "shield", link: "contracts/anchor-registry" },
            { title: "Vault Token ($AVLT)", desc: "EVM-compatible token contract representing fractional pool shares minted to LPs.", icon: "coins", link: "contracts/vault-token" }
          ]
        }
      ]
    }
  },
  {
    id: "contracts/corridor-vault",
    title: "Corridor Pool Vault Contract",
    sidebarTitle: "Corridor Vault",
    description: "Primary pool reserve smart contract managing draws, deposits, and fee execution.",
    category: "Smart Contracts",
    icon: Code2,
    content: {
      type: "rich",
      sections: [
        {
          text: "The `anchor_vault` contract is the core primitive. It maintains the idle USDC reserve balances, calculates active utilization, and governs dynamic withdrawals."
        },
        {
          title: "Key Entrypoints (Rust)",
          codeBlock: {
            language: "rust",
            code: "#[contractimpl]\nimpl AnchorVault {\n    // Deposit USDC, receive AVLT shares\n    pub fn deposit(env: Env, user: Address, amount: i128) -> i128;\n\n    // Burn AVLT shares, receive USDC\n    pub fn withdraw(env: Env, user: Address, shares: i128) -> i128;\n\n    // Authorized anchor draws USDC from reserves\n    pub fn draw_liquidity(env: Env, anchor: Address, amount: i128) -> i128;\n\n    // Repay outstanding draw + dynamic fee\n    pub fn repay_liquidity(env: Env, anchor: Address, principal: i128) -> i128;\n}"
          }
        }
      ]
    }
  },
  {
    id: "contracts/anchor-registry",
    title: "Anchor Registry Contract",
    sidebarTitle: "Anchor Registry",
    description: "Whitelisting node, credit line parameters, and collateral requirements.",
    category: "Smart Contracts",
    icon: Cpu,
    content: {
      type: "rich",
      sections: [
        {
          text: "The `anchor_registry` smart contract governs anchor registration, credit capacity, and locked collateral stakes."
        },
        {
          title: "Key Entrypoints (Rust)",
          codeBlock: {
            language: "rust",
            code: "#[contractimpl]\nimpl AnchorRegistry {\n    // Governance registers new anchor details\n    pub fn register_anchor(env: Env, anchor: Address, limit: i128);\n\n    // Lock AVLT tokens to meet collateral ratio constraints\n    pub fn lock_collateral(env: Env, anchor: Address, amount: i128);\n\n    // Release locked collateral if threshold is satisfied\n    pub fn release_collateral(env: Env, anchor: Address, amount: i128);\n\n    // Slash collateral and freeze credit on default\n    pub fn trigger_slash(env: Env, anchor: Address) -> i128;\n}"
          }
        }
      ]
    }
  },
  {
    id: "contracts/vault-token",
    title: "Vault Share Token ($AVLT)",
    sidebarTitle: "Vault Token",
    description: "LP share representations minted dynamically on deposits.",
    category: "Smart Contracts",
    icon: Key,
    content: {
      type: "rich",
      sections: [
        {
          text: "The `vault_token` contract implements EVM's standard token interface (SEP-41), representing fractional pool shares minted to Liquidity Providers."
        },
        {
          title: "Key Details",
          bulletPoints: [
            "The Corridor Pool Vault acts as the exclusive administrator of the token.",
            "Only the vault has minting and burning privileges.",
            "Can be staked back into the Anchor Registry to satisfy anchor collateral ratios."
          ]
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // SDK & INTEGRATION
  // -------------------------------------------------------------
  {
    id: "sdk/typescript-sdk",
    title: "TypeScript SDK Reference",
    sidebarTitle: "TypeScript SDK",
    description: "Build on-chain integrations, wallet handshakes, and event listeners.",
    category: "SDK & Integration",
    icon: FolderOpen,
    content: {
      type: "rich",
      sections: [
        {
          text: "The AnchorVault SDK provides JavaScript/TypeScript developers with unified bindings to query state, build transactions, and hook into protocol event streams."
        },
        {
          title: "Library Initialization",
          codeBlock: {
            language: "typescript",
            code: "import { AnchorVaultClient } from '@AnchorVault/sdk';\nimport { rpc } from '@Robinhood Chain/Robinhood Chain-sdk';\n\nconst rpcServer = new rpc.Server('https://mainnet.EVMrpc.com');\nconst vaultClient = new AnchorVaultClient({\n  contractId: 'CDO3GSX27G6TAHLBROCC6WV4TNM6BWLFZDT2OW6RSUVBSGZJKTIISJFG',\n  server: rpcServer\n});"
          }
        }
      ]
    }
  },
  {
    id: "sdk/transaction-building",
    title: "Transaction Building",
    sidebarTitle: "Transaction Building",
    description: "Construct, simulate, and prepare on-chain transactions for signing.",
    category: "SDK & Integration",
    icon: Hammer,
    content: {
      type: "rich",
      sections: [
        {
          text: "All mutating contract calls must be wrapped in transactions, simulated to resolve footprints, and signed by active Freighter wallets."
        },
        {
          title: "Interactive Deposit Pipeline",
          codeBlock: {
            language: "typescript",
            code: "import { TransactionBuilder, nativeToScVal } from '@Robinhood Chain/Robinhood Chain-sdk';\n\nasync function buildDepositTx(userAddress: string, amount: number) {\n  const sourceAccount = await rpcServer.getLedgerAccount(userAddress);\n  const amountInteger = BigInt(amount * 10 ** 7); // 7 decimal places\n\n  const tx = new TransactionBuilder(sourceAccount, { fee: '100000' })\n    .addOperation(vaultContract.call(\n      'deposit',\n      nativeToScVal(userAddress, { type: 'address' }),\n      nativeToScVal(amountInteger, { type: 'i128' })\n    ))\n    .setTimeout(30)\n    .build();\n\n  return tx.toXDR();\n}"
          }
        }
      ]
    }
  },
  {
    id: "sdk/querying-state",
    title: "Querying Protocol State",
    sidebarTitle: "Querying State",
    description: "Simulate read-only state checks for UI metrics, APR, and balances.",
    category: "SDK & Integration",
    icon: Globe,
    content: {
      type: "rich",
      sections: [
        {
          text: "AnchorVault enables fast, fee-less state querying by simulating read-only smart contract operations against EVM RPC endpoints."
        },
        {
          title: "Query Reserves & Utilization",
          codeBlock: {
            language: "typescript",
            code: "const poolState = await vaultClient.getPoolState();\nconsole.log('Idle Reserves:', poolState.reserve_balance / 10**7);\nconsole.log('Active Draws:', poolState.active_draws / 10**7);\n\nconst utilizationBps = (poolState.active_draws * 10000) / \n  (poolState.reserve_balance + poolState.active_draws);\nconsole.log('Utilization:', utilizationBps / 100, '%');"
          }
        }
      ]
    }
  },
  {
    id: "sdk/wallet-integration",
    title: "Robinhood Wallets Integration",
    sidebarTitle: "Wallet Integration",
    description: "Freighter, xBull, and LOBSTR browser wallet connectors.",
    category: "SDK & Integration",
    icon: Wrench,
    content: {
      type: "rich",
      sections: [
        {
          text: "Authenticate users and collect secure cryptographic signatures using Freighter and other major Robinhood Chain browser adapters."
        },
        {
          title: "Freighter Signature Flow",
          codeBlock: {
            language: "typescript",
            code: "import { isConnected, signTransaction } from '@Robinhood Chain/freighter-api';\n\nasync function signWithFreighter(txXdr: string) {\n  if (await isConnected()) {\n    const signedXdr = await signTransaction(txXdr, {\n      network: 'MAINNET',\n      networkPassphrase: 'Public Global Robinhood Chain Network ; September 2015'\n    });\n    return signedXdr;\n  }\n  throw new Error('Freighter Wallet extension not detected.');\n}"
          }
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // DEPLOYMENT
  // -------------------------------------------------------------
  {
    id: "deployment/prerequisites",
    title: "Deployment Prerequisites",
    sidebarTitle: "Prerequisites",
    description: "Initial environmental configurations and local developer setup requirements.",
    category: "Deployment",
    icon: ShieldAlert,
    content: {
      type: "rich",
      sections: [
        {
          text: "Before launching contract deployments to the Robinhood Chain Mainnet, make sure you configure your network credentials."
        },
        {
          title: "Secure Environmental File (.env)",
          text: "Ensure your .env file in the root workspace contains these valid entries:",
          codeBlock: {
            language: "env",
            code: "DEPLOYER_SECRET_KEY=\"SXXXX...your-secret-key...\"\nDEPLOYER_PUBLIC_KEY=\"GXXXX...your-public-key...\"\nRobinhood Chain_NETWORK=\"mainnet\"\nEVM_RPC_URL=\"https://mainnet.EVMrpc.com\"\nRobinhood Chain_NETWORK_PASSPHRASE=\"Public Global Robinhood Chain Network ; September 2015\""
          }
        }
      ]
    }
  },
  {
    id: "deployment/compile-contracts",
    title: "Compiling Contracts",
    sidebarTitle: "Compile Contracts",
    description: "Compile modular Rust source code to size-optimized WASM targets.",
    category: "Deployment",
    icon: BadgeAlert,
    content: {
      type: "rich",
      sections: [
        {
          text: "EVM enforces absolute file size constraints for smart contract WASM binaries. We compile using release optimizations and run optimize wrappers."
        },
        {
          title: "Build and Optimize Compilation Pipeline",
          codeBlock: {
            language: "bash",
            code: "# 1. Compile source crates to target wasm32 targets\ncargo build --target wasm32-unknown-unknown --release\n\n# 2. Run size optimize CLI routines\nRobinhood Chain contract optimize --wasm target/wasm32-unknown-unknown/release/anchor_vault.wasm\nRobinhood Chain contract optimize --wasm target/wasm32-unknown-unknown/release/anchor_registry.wasm"
          }
        }
      ]
    }
  },
  {
    id: "deployment/deploy-mainnet",
    title: "Deploying to Robinhood Chain Mainnet",
    sidebarTitle: "Deploy Mainnet",
    description: "Host contracts on the Robinhood Chain network and retrieve coordinates.",
    category: "Deployment",
    icon: Server,
    content: {
      type: "rich",
      sections: [
        {
          text: "Deploy optimized binaries to Robinhood Chain Mainnet, register addresses, and automatically generate frontend configuration hooks."
        },
        {
          title: "Automated Deploy Script",
          codeBlock: {
            language: "bash",
            code: "npm run deploy"
          },
          infoCallout: {
            title: "Config Auto-Update",
            text: "This script uploads compiled WASM, creates contract instances on-chain, and syncs the address values in both your .env file and src/lib/EVM.ts."
          }
        }
      ]
    }
  },
  {
    id: "deployment/initialize-protocol",
    title: "On-Chain Protocol Initialization",
    sidebarTitle: "Initialize Protocol",
    description: "Configure administrators, collateral thresholds, and curve constants.",
    category: "Deployment",
    icon: Wrench,
    content: {
      type: "rich",
      sections: [
        {
          text: "Deploying the contract is only the first step. You must initialize connections, configure administrators, and set dynamic math parameters on-chain."
        },
        {
          title: "Automated Setup Protocol",
          codeBlock: {
            language: "bash",
            code: "npm run initialize"
          },
          bulletPoints: [
            "USDC Token: Sets token administrator permissions to allow mainnet faucet minting.",
            "AVLT Token: Delegates mint/burn permissions to the Corridor Vault contract.",
            "Anchor Registry: Establishes a 10% (1000 bps) minimum collateral ratio requirement.",
            "Corridor Vault: Connects USDC/AVLT addresses and locks Two-Slope utilization parameters."
          ]
        }
      ]
    }
  },
  {
    id: "deployment/register-anchors",
    title: "Whitelisting Payment Anchors",
    sidebarTitle: "Register Anchors",
    description: "Add payment gateways, verify collateral, and allocate initial credit capacity.",
    category: "Deployment",
    icon: Coins,
    content: {
      type: "rich",
      sections: [
        {
          text: "Add licensed remittance Anchors to the registry on-chain using registry write calls."
        },
        {
          title: "Robinhood Chain CLI Registration",
          codeBlock: {
            language: "bash",
            code: "Robinhood Chain contract invoke \\\n  --id CC2C5V3L3MMK6H3T3LBNJ2ALQHVWXVV4FRQY5BPCO4BCL2EFQFOGTPXN \\\n  --source admin_identity \\\n  --network mainnet \\\n  -- \\\n  register_anchor \\\n  --anchor GBF4PJKVXGAIDZCYBEGNHAODE4BM3RHIN3EZMS3XHPRHCLPT2JNZPME6 \\\n  --limit 1500000000000"
          },
          tipCallout: {
            title: "Scaling Coordinates",
            text: "All USDC parameters must be expressed in 7-decimal integer scaling. $150,000 becomes 1500000000000 in integer space."
          }
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // API REFERENCE
  // -------------------------------------------------------------
  {
    id: "api-reference/introduction",
    title: "Contract API Reference",
    sidebarTitle: "Introduction",
    description: "Complete query and invoke function reference for AnchorVault contracts.",
    category: "API Reference",
    icon: Code2,
    content: {
      type: "rich",
      sections: [
        {
          text: "Welcome to the official AnchorVault Smart Contract API Reference. This directory contains detailed descriptions, argument types, and return value declarations for every callable function in the protocol."
        },
        {
          title: "API Categories",
          cards: [
            { title: "Corridor Vault Functions", desc: "Mutating entrypoints for LPs and payment anchors.", icon: "building-columns", link: "api-reference/vault-functions" },
            { title: "Registry Functions", desc: "Staking, whitelisting, and collateral lockup management.", icon: "shield", link: "api-reference/registry-functions" },
            { title: "Token Functions", desc: "Standard SEP-41 token interactions for $AVLT.", icon: "coins", link: "api-reference/token-functions" },
            { title: "View & Query Functions", desc: "Read-only getters for rates, capacities, and reserves.", icon: "search", link: "api-reference/view-functions" }
          ]
        }
      ]
    }
  },
  {
    id: "api-reference/vault-functions",
    title: "Corridor Vault Contract Functions",
    sidebarTitle: "Vault Functions",
    description: "Write calls to the Corridor Vault smart contract.",
    category: "API Reference",
    icon: Server,
    content: {
      type: "rich",
      sections: [
        {
          title: "1. deposit",
          text: "Deposits stablecoins to pool reserves. Mints and returns pro-rata share tokens ($AVLT) back to the LP address.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["user", "Address", "Ledger coordinates of the depositor"],
              ["amount", "i128", "USDC amount (scaled to 10^7 integer)"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn deposit(env: Env, user: Address, amount: i128) -> i128;"
          }
        },
        {
          title: "2. withdraw",
          text: "Burns shares and releases proportional stablecoins. Distributes any pending yield automatically.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["user", "Address", "Ledger coordinates of the withdrawer"],
              ["shares", "i128", "Amount of $AVLT share tokens to burn"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn withdraw(env: Env, user: Address, shares: i128) -> i128;"
          }
        },
        {
          title: "3. draw_liquidity",
          text: "Allows registered anchors to draw USDC from available pool reserves to execute corridor settlements.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["anchor", "Address", "Registered coordinates of the borrowing anchor"],
              ["amount", "i128", "USDC principal requested"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn draw_liquidity(env: Env, anchor: Address, amount: i128) -> i128;"
          }
        },
        {
          title: "4. repay_liquidity",
          text: "Allows payment anchors to repay their drawn principal plus dynamic utilization-based fees.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["anchor", "Address", "Coordinates of the paying anchor"],
              ["principal", "i128", "USDC principal to repay (fees are calculated on top of this amount)"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn repay_liquidity(env: Env, anchor: Address, principal: i128) -> i128;"
          }
        }
      ]
    }
  },
  {
    id: "api-reference/registry-functions",
    title: "Anchor Registry Contract Functions",
    sidebarTitle: "Registry Functions",
    description: "Write calls to the Anchor Registry smart contract.",
    category: "API Reference",
    icon: ShieldCheck,
    content: {
      type: "rich",
      sections: [
        {
          title: "1. register_anchor",
          text: "Adds or updates anchor configurations (credit limits, whitelists) inside registry storage. Accessible only by admin/governance.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["anchor", "Address", "Coordinates of the target payment anchor"],
              ["limit", "i128", "Maximum USDC credit capacity allocated"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn register_anchor(env: Env, anchor: Address, limit: i128);"
          }
        },
        {
          title: "2. lock_collateral",
          text: "Allows anchors to deposit $AVLT share tokens as backing collateral for their credit line capacity.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["anchor", "Address", "Coordinates of the staking anchor"],
              ["amount", "i128", "$AVLT token amount to lock"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn lock_collateral(env: Env, anchor: Address, amount: i128);"
          }
        },
        {
          title: "3. release_collateral",
          text: "Releases locked $AVLT collateral back to the anchor, provided they maintain a healthy 10% collateral-to-credit ratio.",
          table: {
            headers: ["Parameter", "Type", "Description"],
            rows: [
              ["anchor", "Address", "Coordinates of the anchor requesting release"],
              ["amount", "i128", "$AVLT token amount to unlock"]
            ]
          },
          codeBlock: {
            language: "rust",
            code: "pub fn release_collateral(env: Env, anchor: Address, amount: i128);"
          }
        }
      ]
    }
  },
  {
    id: "api-reference/token-functions",
    title: "Vault Share Token ($AVLT) Functions",
    sidebarTitle: "Token Functions",
    description: "Standard SEP-41 token interfaces.",
    category: "API Reference",
    icon: Coins,
    content: {
      type: "rich",
      sections: [
        {
          text: "$AVLT implements the standard EVM token interface (equivalent to ERC-20) supporting these key queries and transfers."
        },
        {
          title: "1. balance",
          text: "Returns the current $AVLT token balance for any target account address.",
          codeBlock: {
            language: "rust",
            code: "pub fn balance(env: Env, id: Address) -> i128;"
          }
        },
        {
          title: "2. transfer",
          text: "Transfers tokens between standard ledger coordinates.",
          codeBlock: {
            language: "rust",
            code: "pub fn transfer(env: Env, from: Address, to: Address, amount: i128);"
          }
        },
        {
          title: "3. approve",
          text: "Grants a spender allowance to transfer tokens on behalf of the owner address.",
          codeBlock: {
            language: "rust",
            code: "pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32);"
          }
        }
      ]
    }
  },
  {
    id: "api-reference/view-functions",
    title: "Read-Only View Functions",
    sidebarTitle: "View Functions",
    description: "Read-only getter functions for querying real-time protocol metrics.",
    category: "API Reference",
    icon: Globe,
    content: {
      type: "rich",
      sections: [
        {
          title: "1. get_pool_state",
          text: "Returns the global Corridor Vault state struct (deposits, reserves, fee curve settings).",
          codeBlock: {
            language: "rust",
            code: "pub fn get_pool_state(env: Env) -> PoolState;"
          }
        },
        {
          title: "2. get_anchor_state",
          text: "Queries the Corridor Vault's local status records for any specific registered anchor.",
          codeBlock: {
            language: "rust",
            code: "pub fn get_anchor_state(env: Env, anchor: Address) -> AnchorState;"
          }
        },
        {
          title: "3. get_reputation_score",
          text: "Queries the Anchor Registry for the current on-chain credit score (0-1000) of an anchor.",
          codeBlock: {
            language: "rust",
            code: "pub fn get_reputation_score(env: Env, anchor: Address) -> u32;"
          }
        },
        {
          title: "4. calculate_fee",
          text: "Simulates the exact dynamic stablecoin settlement fee rate (in basis points) for an anchor draw.",
          codeBlock: {
            language: "rust",
            code: "pub fn calculate_fee(env: Env, anchor: Address, amount: i128) -> i128;"
          }
        }
      ]
    }
  }
];
