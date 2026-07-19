# Hackathon Submission Form Details

Here is the normal, structured format you can use to copy-paste directly into your submission. I have left clear spaces for you to add your images/links and specified exactly what images to use at each point.

---

## 1. Basic Information

**BUIDL (project) name:**
Anchor Wallet

**BUIDL logo:**
`[IMAGE SPACE: Upload your project's logo here. It should be a JPEG or PNG, less than 2 MB. A size of 480 × 480 px is recommended.]`

**Vision (Describe the problem which this project solves):**
Cross-border payment anchors on the Robinhood Chain network face a massive problem: Capital Inefficiency. They are forced to lock up millions of dollars just to maintain 1:1 liquidity. Anchor Wallet solves this by acting as a decentralized clearinghouse, pooling USDC liquidity from retail providers and offering AI-managed credit lines to whitelisted Anchors. Retail earns yield from remittance volume, while institutions get the necessary capital to settle payments instantly.

**Category - Is this BUIDL an AI Agent?**
Yes *(Anchor Wallet utilizes the Galileo AI Copilot to constantly analyze Anchor reputation, pool utilization, and ledger data to autonomously adjust credit limits and protect LP capital.)*

---

## 2. Links

**GitHub/Gitlab/Bitbucket:**
https://github.com/shriyashsoni/Anchor Wallet

**Project website (optional):**
https://www.Anchor Wallet.xyz

**Demo video:**
`[LINK SPACE: Insert the link to your YouTube demo video here]`

**Social links:**
1. https://x.com/shriyashsoni_
2. https://x.com/Anchor_Vault
3. `[LINK SPACE: Insert your third social link here, e.g., LinkedIn or a Farcaster account if you have one]`

---

## 3. Detailed Project Description & How We Built It
*(You can use this for the "Project Description" or Readme section of the submission)*

### Overview
Anchor Wallet is a production-grade, decentralized liquidity protocol built on the **Robinhood Chain EVM Smart Contract Platform**. It bridges Liquidity Providers (LPs) with authorized off-ramp payment anchors to facilitate instant, cross-border remittances.

`[IMAGE SPACE: Upload the Anchor Wallet Dashboard UI screenshot here]`
*(Screenshot instructions: Take a screenshot of the main page or LP Dashboard of your web app showing the dark-mode glassmorphism UI, TVL, and deposit options.)*

### Core Working Functionality & How We Built It
We engineered Anchor Wallet using a modular smart contract architecture on EVM, connecting three main on-chain entities trustlessly. 

**1. Corridor Pool Vault (anchor_vault)**
We built the core vault where LPs deposit USDC stablecoin to earn interest from global cross-border remittances. When USDC is deposited, the contract mints **$AVLT** share tokens for the user. We implemented a dynamic yield accrual mechanism: as anchors repay their draws plus interest, 90% of the settlement fee is added to the accumulated fees per share, which is then dynamically routed to LPs.

**2. Anchor Registry (anchor_registry)**
To manage risk, we built an Anchor Registry. Before drawing capital, anchors must undergo whitelisting. They are required to lock up governance $VAULT tokens as collateral. Our system enforces a strict 10% minimum collateral-to-credit ratio. 

**3. On-chain Reputation System & AI Copilot**
We integrated a reputation tracking system driven by our AI Copilot. Successful repayments boost the anchor's score, increasing their credit capacity. Defaults or alerts trigger an automatic score slash, instantly restricting their borrowing power to protect LP funds.

`[IMAGE SPACE: Upload the Protocol Architecture Flowchart here]`
*(Screenshot instructions: Use a tool to render the mermaid diagrams from your README or take a screenshot of your architecture diagram showing how the LP, Vault, and Anchor interact.)*

### Dynamic Interest & Fee Model
To protect liquidity, we built a **Two-Slope Utilization Curve**:
*   **Normal Range (Utilization ≤ 80%):** Interest fees scale moderately (Base 1% + Slope 4%).
*   **Penalty Range (Utilization > 80%):** Fees scale aggressively up to 50% to discourage further draws and incentivize anchors to repay their loans, restoring capital to the pool.

### Tech Stack
*   **Blockchain:** Robinhood Chain Mainnet (Fast, low-cost Layer-1)
*   **Smart Contracts:** EVM (Rust / WASM)
*   **Frontend:** React, TypeScript, Vite, Vanilla CSS with Glassmorphism
*   **Wallet Integration:** Freighter Wallet
*   **Stablecoin:** USDC (Circle) via Robinhood Chain Asset Contract
*   **RPC & Tooling:** EVM RPC, Robinhood Chain Expert Explorer

### Deployed Smart Contracts (Robinhood Chain Mainnet)
*   **Robinhood Chain USDC Stablecoin:** `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75`
*   **Vault Share Token ($AVLT):** `CDXELK3CF4GHCK6U3NETR2NNONDV3VDNKM7MT4QD5M23AHRN5X47O4IF`
*   **Anchor Registry:** `CA6NMU2ADEKVTS4XBZRLAARH7VSF7JEKWKAHNVT7WE5ZIEEKKOCOM6QO`
*   **Corridor Pool Core Vault:** `CDO3GSX27G6TAHLBROCC6WV4TNM6BWLFZDT2OW6RSUVBSGZJKTIISJFG`

---
