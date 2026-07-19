const { rpc } = require('@stellar/stellar-sdk');

async function test() {
  const server = new rpc.Server("https://soroban-rpc.mainnet.stellar.org");
  try {
    const acc = await server.getAccount("GD2FDWLWDPCPSG5GJBCUE5TCVT4TVI3NBXD2DO3A2MDNDXLHFFYKX4LU");
    console.log("Account found:", acc);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
