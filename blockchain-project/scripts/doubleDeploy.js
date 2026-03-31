const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Fabbrica gli NFT 
  const VIPPass = await ethers.getContractFactory("VIPPass");
  const nftContract = await VIPPass.deploy();
  await nftContract.waitForDeployment();
  const nftAddress = nftContract.target;
  console.log("Contratto NFT (VIPPass) deployato a:", nftAddress);

  // Fabbrica il Guestbook, passandogli l'indirizzo dell'NFT come "chiave"
  const AdvancedGuestbook = await ethers.getContractFactory("AdvancedGuestbook");
  const guestbookContract = await AdvancedGuestbook.deploy(nftAddress);
  await guestbookContract.waitForDeployment();
  const guestbookAddress = guestbookContract.target;
  console.log("AdvancedGuestbook deployato a:", guestbookAddress);

  // Esporta indirizzi e ABI per React
  const guestbookArtifact = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../artifacts/contracts/AdvancedGuestbook.sol/AdvancedGuestbook.json"), "utf8")); 
  const nftArtifact = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../artifacts/contracts/VIPPass.sol/VIPPass.json"), "utf8"));

  const contractData = {
    guestbookAddress: guestbookAddress,
    guestbookAbi: guestbookArtifact.abi,
    nftAddress: nftAddress,
    nftAbi: nftArtifact.abi
  };

  // path frontend 
  const frontendConfigPath = path.resolve(__dirname, "../guestbook-frontend/src/contractConfig.json");
  fs.writeFileSync(frontendConfigPath, JSON.stringify(contractData, null, 2));
  
  console.log("Dati esportati con successo per il frontend!");
}

main().catch(console.error);