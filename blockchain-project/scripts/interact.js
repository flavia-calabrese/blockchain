const { ethers } = require("hardhat");

async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // quello del deploy

  const MessageStorage_1 = await ethers.getContractFactory("MessageStorage_1");
  const contract = await MessageStorage_1.attach(address);


  // account locale (Hardhat ne crea 20)
  const [signer] = await ethers.getSigners();
 
  console.log("Usando account:", signer.address);

  //const first_message = await contract.getMessage();

  //console.log("Messaggio (1) letto:", first_message);

  // ------------------------
  // SCRITTURA (TRANSAZIONE)
  // ------------------------
  console.log("Invio messaggio da user1...");
  const tx = await contract.connect(signer).setMessage("Ciao sono user1!");
  await tx.wait();

  console.log("Messaggio salvato!");

  // ------------------------
  // LETTURA (CALL)
  // ------------------------
  const message = await contract.getMessage();

  console.log("Messaggio letto:", message);

}

main().catch(console.error);