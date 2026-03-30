const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // 
    const DecentralizedGuestbook = await ethers.getContractFactory("DecentralizedGuestbook");
    const contract = await DecentralizedGuestbook.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = contract.target;
    console.log("DecentralizedGuestbook deployed to:", contractAddress);

    // Recupera l'ABI dal file JSON generato in automatico da Hardhat durante la compilazione
    const artifactPath = path.resolve(__dirname, "../artifacts/contracts/DecentralizedGuestbook.sol/DecentralizedGuestbook.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contractData = {
        address: contractAddress,
        abi: artifact.abi,
    };

    const frontendConfigPath = path.resolve(__dirname, "../guestbook-frontend/src/contractConfig.json");
    fs.writeFileSync(frontendConfigPath, JSON.stringify(contractData, null, 2));

    console.log("Contract address and ABI saved to guestbook-frontend/src/contractConfig.json");
}

main().catch(console.error);