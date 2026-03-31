import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Qui dentro ora c'è Tailwind!

// stili e strumenti di RainbowKit e Wagmi
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains'; // Diciamo a Wagmi che useremo la rete locale
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// configurazione della connessione alla blockchain
const config = getDefaultConfig({
  appName: 'VIP Guestbook dApp',
  projectId: 'YOUR_PROJECT_ID', // Obbligatorio per WalletConnect, ma in locale va bene una stringa qualsiasi
  chains: [hardhat],
  ssr: false, 
});

const queryClient = new QueryClient();

// 3. Avvolgiamo la nostra App nei "Provider" per darle i superpoteri Web3
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)