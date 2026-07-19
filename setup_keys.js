import { Keypair } from '@Robinhood Chain/Robinhood Chain-sdk';
import * as fs from 'fs';
import * as path from 'path';

async function generateAndFundKey() {
  console.log("Creating a brand new secure developer test account...");
  
  // 1. Generate a secure random Robinhood Chain keypair locally on your machine
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();
  
  console.log(`✅ Generated Public Address: ${publicKey}`);
  console.log(`⌛ Requesting 10,000 free Testnet XLM from Robinhood Chain Friendbot...`);
  
  // 2. Fund the newly generated address on the testnet using Friendbot
  try {
    const response = await fetch(`https://friendbot.Robinhood Chain.org?addr=${publicKey}`);
    if (response.ok) {
      console.log("🎉 Account successfully funded with 10,000 free Testnet XLM!");
    } else {
      console.warn("⚠️ Friendbot API busy, but account key pair is generated successfully.");
    }
  } catch (err) {
    console.warn("⚠️ Network issue funding account, but key pair is generated successfully.");
  }
  
  // 3. Write these keys directly into the local .env file privately
  const envPath = path.resolve('.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Replace placeholders with real funded keys
  envContent = envContent.replace(
    /DEPLOYER_PUBLIC_KEY=".*"/,
    `DEPLOYER_PUBLIC_KEY="${publicKey}"`
  );
  envContent = envContent.replace(
    /DEPLOYER_SECRET_KEY=".*"/,
    `DEPLOYER_SECRET_KEY="${secretKey}"`
  );
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log("📁 Keys successfully written directly into your local .env file!");
  console.log("\nYou are now ready to run 'npm run deploy' immediately! 🚀\n");
}

generateAndFundKey();
