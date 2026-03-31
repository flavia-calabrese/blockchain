const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // recupero gli indirizzi dei contratti salvati durante il deploy
  const configPath = path.resolve(__dirname, "../guestbook-frontend/src/contractConfig.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  // prendo il secondo account disponibile nel nodo locale per fare da "Utente"
  const signers = await ethers.getSigners();
  const user = signers[1]; 
  // signers[0] è l'admin (chi fa il deploy del contratto), uso l'account 1 come ospite

  console.log("--- INIZIO SIMULAZIONE DAPP ---");
  console.log("Account Ospite:", user.address);

  // mi connetto ai due contratti
  const nftContract = await ethers.getContractAt(config.nftAbi, config.nftAddress);
  const guestbookContract = await ethers.getContractAt(config.guestbookAbi, config.guestbookAddress);

  // ---------------------------------------------------------
  // test 1: L'ospite prova a entrare senza la tessera VIP
  // ---------------------------------------------------------
  console.log("\n test 1: L'ospite tenta di scrivere un messaggio SENZA l'NFT...");
  try {
    await guestbookContract.connect(user).leaveMessage("Fatemi entrare!");
    console.log("❌ ERRORE: Il sistema ha fallito, il messaggio è passato!");
  } catch (error) {
    console.log("✅ SUCCESSO: Il contratto ha bloccato l'ospite perché non ha il Pass VIP.");
  }

  // ---------------------------------------------------------
  // test 2: L'ospite richiede la sua tessera VIP
  // ---------------------------------------------------------
  console.log("\n test 2: L'ospite conia (mint) il suo NFT gratuito...");
  const mintTx = await nftContract.connect(user).mint();
  await mintTx.wait(); 
  
  const balance = await nftContract.balanceOf(user.address);
  console.log(`✅ SUCCESSO: Ora l'ospite possiede ${balance} Pass VIP.`);

  // ---------------------------------------------------------
  // test 3: L'ospite riprova a entrare e lascia una mancia
  // ---------------------------------------------------------
  console.log("\n test 3: L'ospite scrive il messaggio e allega 1 ETH di mancia...");
  const tipAmount = ethers.parseEther("1.0"); // converto 1 ETH nel formato corretto
  
  const msgTx = await guestbookContract.connect(user).leaveMessage("Adesso sono VIP e vi lascio la mancia!", { value: tipAmount });
  await msgTx.wait();
  console.log("✅ SUCCESSO: Il messaggio è stato salvato e la mancia è stata incassata dal contratto!");

  // ---------------------------------------------------------
  // test 4: Leggiamo la bacheca per conferma
  // ---------------------------------------------------------
  console.log("\n test 4: Lettura pubblica della bacheca:");
  const messages = await guestbookContract.getAllMessages();
  console.log(`Messaggi totali trovati: ${messages.length}`);
  console.log(`- Autore: ${messages[0].author}`);
  console.log(`- Testo: "${messages[0].content}"`);
  console.log(`- Mancia allegata: ${ethers.formatEther(messages[0].tipAmount)} ETH`);

  console.log("\n--- SIMULAZIONE COMPLETATA ---");
}

main().catch(console.error);