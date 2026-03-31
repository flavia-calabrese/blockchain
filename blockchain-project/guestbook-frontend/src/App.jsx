import { ConnectButton } from "@rainbow-me/rainbowkit";
import configData from "./contractConfig.json";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";

function App() {
  // Wagmi ci fornisce in automatico lo stato della connessione
  const { address, isConnected } = useAccount();

  // Stati per i campi di input
  const [messageInput, setMessageInput] = useState("");
  const [tipInput, setTipInput] = useState("0");

  // lettura dati dalla blockchain (es. messaggi, saldo del contratto, ecc.) con useReadContract
  const { data: nftBalance, refetch: refetchBalance } = useReadContract({
    address: configData.nftAddress,
    abi: configData.nftAbi,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address, // esegui solo se connesso
    },
  });

  const { data: messages, refetch: refetchMessages } = useReadContract({
    address: configData.guestbookAddress,
    abi: configData.guestbookAbi,
    functionName: "getAllMessages",
  });

  // scrittura dati sulla blockchain (es. inviare un messaggio) con useWriteContract
  const { writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    writeContract(
      {
        address: configData.nftAddress,
        abi: configData.nftAbi,
        functionName: "mint",
      },
      {
        onSuccess: () => setTimeout(() => refetchBalance(), 2000), // dopo 2 secondi aggiorna il saldo
      },
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    writeContract(
      {
        address: configData.guestbookAddress,
        abi: configData.guestbookAbi,
        functionName: "leaveMessage",
        args: [messageInput],
        value: parseEther(tipInput || "0"), // converti il tip in wei
      },
      {
        onSuccess: () => {
          setTimeout(() => refetchMessages(), 2000); // dopo 2 secondi aggiorna i messaggi
          setMessageInput(""); // reset del campo messaggio
          setTipInput("0"); // reset del campo tip
        },
      },
    );
  };

  const isVip = nftBalance && Number(nftBalance) > 0; // se ha almeno 1 NFT è VIP

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4 font-sans">
      {/* HEADER */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          VIP Guestbook
        </h1>
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-8">
        {!isConnected ? (
          // SCHERMATA: Non Connesso
          <div className="text-center p-16 bg-slate-800/30 rounded-3xl border border-slate-700/50">
            <div className="text-6xl mb-6">🚪</div>
            <h2 className="text-3xl font-bold mb-4">Accesso Riservato</h2>
            <p className="text-slate-400 text-lg">
              Connetti il tuo portafoglio Web3 per entrare.
            </p>
          </div>
        ) : !isVip ? (
          // SCHERMATA: Connesso ma NON VIP (Deve fare il Mint)
          <div className="text-center p-16 bg-slate-800/80 rounded-3xl border border-pink-500/30 shadow-xl">
            <div className="text-6xl mb-6">🎟️</div>
            <h2 className="text-3xl font-bold mb-4">Ti serve un Pass VIP!</h2>
            <p className="text-slate-400 mb-8">
              Non possiedi ancora l'NFT necessario per scrivere sulla bacheca.
              Ottienilo gratis ora.
            </p>
            <button
              onClick={handleMint}
              disabled={isPending}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isPending
                ? "Coniazione in corso..."
                : "Richiedi Pass VIP Gratuito"}
            </button>
          </div>
        ) : (
          // SCHERMATA: VIP (Puo' scrivere e leggere i messaggi)
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FORM PER SCRIVERE */}
            <div className="md:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-purple-500/30 h-fit">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✍️ Scrivi Messaggio
              </h3>
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-4"
              >
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Cosa stai pensando?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none h-32"
                  required
                />
                <div>
                  <label className="text-sm text-slate-400 block mb-1">
                    Allega una mancia (ETH/GO)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={tipInput}
                    onChange={(e) => setTipInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors mt-2 disabled:opacity-50"
                >
                  {isPending ? "Invio..." : "Firma e Invia"}
                </button>
              </form>
            </div>

            {/* BACHECA MESSAGGI */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                📜 I Messaggi del Club
              </h3>

              {!messages || messages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-2xl">
                  Nessun messaggio ancora. Sii il primo!
                </div>
              ) : (
                [...messages].reverse().map(
                  (msg, index) =>
                    // Mostriamo solo i messaggi non nascosti dall'admin
                    !msg.isHidden && (
                      <div
                        key={index}
                        className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col gap-3 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start text-sm">
                          <span className="font-mono text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                            {msg.author.slice(0, 6)}...{msg.author.slice(-4)}
                          </span>
                          {Number(msg.tipAmount) > 0 && (
                            <span className="text-green-400 bg-green-900/20 px-2 py-1 rounded font-bold">
                              💰 {formatEther(msg.tipAmount)} ETH
                            </span>
                          )}
                        </div>
                        <p className="text-lg text-slate-200">{msg.content}</p>
                      </div>
                    ),
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
