const { ethers } = require("hardhat");

async function main() {
  // 1. Fabbrica l'UNICA "lavagna" (Deploy del contratto)
  const MessageStorage = await ethers.getContractFactory("MessageStorage");
  const contract = await MessageStorage.deploy();
  await contract.waitForDeployment(); 

  console.log("Contratto deployato all'indirizzo:", contract.target);

  // 2. Prepara i due utenti di test forniti da Hardhat
  const [user1, user2] = await ethers.getSigners();
  
  // 3. User 1 si collega e scrive il SUO messaggio
  console.log("User 1 sta scrivendo...");
  const tx1 = await contract.connect(user1).setMessage("Ciao, sono il primo utente!");
  await tx1.wait();

  // 4. User 2 si collega allo STESSO contratto e scrive il SUO messaggio
  console.log("User 2 sta scrivendo...");
  const tx2 = await contract.connect(user2).setMessage("E io sono il secondo!");
  await tx2.wait();

  // 5. Verifichiamo che i messaggi siano salvati separatamente
  const msgUser1 = await contract.connect(user1).getMessage();
  const msgUser2 = await contract.connect(user2).getMessage();

  console.log("Messaggio letto da User 1:", msgUser1);
  console.log("Messaggio letto da User 2:", msgUser2);
}

main().catch(console.error);