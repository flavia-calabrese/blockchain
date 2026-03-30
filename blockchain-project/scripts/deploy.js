const { ethers } = require("hardhat");

async function main() {
  const MessageStorage_1 = await ethers.getContractFactory("MessageStorage_1");
  const contract = await MessageStorage_1.deploy();

  // Attendi che il contratto venga inserito nella blockchain (sintassi v6)
  await contract.waitForDeployment();

  // Recupera l'indirizzo del contratto tramite la proprietà target
  console.log("Contract address:", contract.target);
}

main().catch(console.error);