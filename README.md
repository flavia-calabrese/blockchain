# 🥂 VIP Guestbook - Web3 dApp

Un'applicazione decentralizzata (dApp) esclusiva e moderna che utilizza il **Token Gating**. Solo gli utenti che possiedono uno specifico NFT (il "VIP Pass") hanno il permesso di interagire con la bacheca scrivendo messaggi, lasciando mance e votando i contenuti degli altri.

## ✨ Funzionalità Principali

* 🎟️ **Token Gating tramite NFT**: Gli utenti non connessi o senza NFT possono solo leggere la bacheca. Per sbloccare il modulo di scrittura, devono prima coniare (mint) un VIP Pass NFT gratuito (standard ERC721).
* ✍️ **Bacheca Immutabile**: I messaggi vengono salvati direttamente sulla blockchain Ethereum, garantendo trasparenza e immutabilità.
* 💰 **Sistema di Donazioni (Tipping)**: Gli utenti possono allegare una mancia in ETH/GO ai loro messaggi per supportare il creatore del locale.
* 👍 **Upvoting**: I possessori del VIP Pass possono votare (Mi Piace) i messaggi degli altri utenti.
* 🛡️ **Pannello Amministratore**: Il portafoglio che ha effettuato il deploy del contratto ottiene poteri speciali (Admin):
  * Può censurare/nascondere messaggi inopportuni dalla vista pubblica.
  * Ha accesso a una dashboard esclusiva per controllare il saldo della "cassaforte" e prelevare le donazioni accumulate.

## 🛠️ Stack Tecnologico

**Backend (Blockchain & Smart Contracts)**
* [Solidity](https://soliditylang.org/) - Linguaggio per i contratti (v0.8.28)
* [Hardhat](https://hardhat.org/) - Ambiente di sviluppo e test blockchain locale
* [OpenZeppelin](https://openzeppelin.com/) - Libreria standard per la sicurezza e l'implementazione dell'ERC721

**Frontend (Interfaccia Utente)**
* [React](https://react.dev/) + [Vite](https://vitejs.dev/) - Framework UI e Bundler
* [Tailwind CSS](https://tailwindcss.com/) (v3) - Styling moderno con effetti Glassmorphism
* [RainbowKit](https://www.rainbowkit.com/) - Gestione del login e connessione wallet elegante
* [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/) - Hooks React per l'interazione con la blockchain
* [Lucide React](https://lucide.dev/) - Iconografia vettoriale

## 🚀 Guida all'Avvio Locale

Per far girare questo progetto sul tuo computer, dovrai avviare sia la blockchain locale che il server del frontend.

### Prerequisiti
* Node.js installato sul tuo computer.
* Un portafoglio Web3 come **MetaMask** installato nel browser.

### 1. Avviare il Backend (La Blockchain)
Apri il terminale nella cartella principale del progetto backend e installa le dipendenze:
```bash
npm install
````
Avvia il tuo nodo blockchain locale (tieni questo terminale sempre aperto):
```bash
npx hardhat node
```

Apri un **secondo terminale** (sempre nella root del backend) e compila i contratti (target: cancun):
```bash
npx hardhat compile
```

Infine, posiziona i contratti sulla blockchain e genera il file di configurazione per il frontend:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Configurare MetaMask
* Apri MetaMask e aggiungi manualmente la rete locale di Hardhat:
  * **Network Name**: Hardhat Local
  * **RPC URL**: `http://127.0.0.1:8545/`
  * **Chain ID**: `31337`
  * **Currency Symbol**: `GO` (o `ETH`)
* Importa almeno uno degli account generati da Hardhat (copiando la Private Key fornita nel terminale del nodo) per avere fondi di test. Il primo account ("Account #0") sarà l'**Admin**.

### 3. Avviare il Frontend
Apri un **terzo terminale**, spostati nella cartella del frontend e installa le dipendenze:
```bash
cd guestbook-frontend
npm install
```

Avvia il server di sviluppo:
```bash
npm run dev
```

Ora puoi visitare `http://localhost:5173` nel tuo browser, connettere MetaMask e interagire con la tua nuova dApp!