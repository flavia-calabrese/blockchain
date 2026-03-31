import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MessageSquare, Send, Ticket, Lock, Unlock, Wallet, Award, ThumbsUp, EyeOff, Eye, ShieldCheck, Banknote } from 'lucide-react';
import configData from './contractConfig.json';

function App() {
  const { address, isConnected } = useAccount();
  const [messageInput, setMessageInput] = useState('');
  const [tipInput, setTipInput] = useState('0');

  // --- LETTURA DATI ---
  const { data: nftBalance, refetch: refetchBalance } = useReadContract({
    address: configData.nftAddress,
    abi: configData.nftAbi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: messages, refetch: refetchMessages } = useReadContract({
    address: configData.guestbookAddress,
    abi: configData.guestbookAbi,
    functionName: 'getAllMessages',
  });

  const { data: adminAddress } = useReadContract({
    address: configData.guestbookAddress,
    abi: configData.guestbookAbi,
    functionName: 'admin',
  });

  // Leggiamo quanti soldi (ETH/GO) ci sono attualmente nel contratto
  const { data: contractBalance, refetch: refetchContractBalance } = useBalance({
    address: configData.guestbookAddress,
  });

  // --- SCRITTURA DATI ---
  const { writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: configData.nftAddress,
      abi: configData.nftAbi,
      functionName: 'mint',
    }, { onSuccess: () => setTimeout(() => refetchBalance(), 2000) });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput) return;
    writeContract({
      address: configData.guestbookAddress,
      abi: configData.guestbookAbi,
      functionName: 'leaveMessage',
      args: [messageInput],
      value: parseEther(tipInput || '0'),
    }, {
      onSuccess: () => {
        setTimeout(() => {
          refetchMessages();
          refetchContractBalance(); // Aggiorniamo anche la cassa
        }, 2000);
        setMessageInput('');
        setTipInput('0');
      }
    });
  };

  // Funzione per Admin: Preleva i fondi dal contratto
  const handleWithdraw = () => {
    writeContract({
      address: configData.guestbookAddress,
      abi: configData.guestbookAbi,
      functionName: 'withdrawTips', 
    }, { onSuccess: () => setTimeout(() => refetchContractBalance(), 2000) });
  };

  const handleUpvote = (index) => {
    writeContract({
      address: configData.guestbookAddress,
      abi: configData.guestbookAbi,
      functionName: 'upvoteMessage',
      args: [index],
    }, { onSuccess: () => setTimeout(() => refetchMessages(), 2000) });
  };

  const handleToggleVisibility = (index) => {
    writeContract({
      address: configData.guestbookAddress,
      abi: configData.guestbookAbi,
      functionName: 'hideMessage',
      args: [index],
    }, { onSuccess: () => setTimeout(() => refetchMessages(), 2000) });
  };

  // --- VARIABILI DI STATO LOGICHE ---
  const isVip = nftBalance && Number(nftBalance) > 0;
  const isAdmin = isConnected && adminAddress && address?.toLowerCase() === adminAddress?.toLowerCase();

  const displayMessages = messages 
    ? messages.map((msg, index) => ({ ...msg, originalIndex: index })).reverse()
    : [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-pink-500/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-pink-500/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VIP Guestbook
            </h1>
            {isAdmin && (
              <span className="ml-3 flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                <ShieldCheck className="w-4 h-4" /> ADMIN
              </span>
            )}
          </div>
          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* PANNELLO SEGRETO ADMIN (Visibile solo all'owner) */}
        {isAdmin && (
          <div className="lg:col-span-12 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div>
              <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-1">
                <Banknote className="w-5 h-5" /> Cassaforte del Locale
              </h3>
              <p className="text-slate-300 text-sm">
                Saldo accumulato dalle donazioni: <span className="font-mono font-bold text-white text-lg ml-1">
                  {contractBalance ? formatEther(contractBalance.value) : '0'} ETH
                </span>
              </p>
            </div>
            <button 
              onClick={handleWithdraw} 
              disabled={isPending || !contractBalance || contractBalance.value === 0n}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Banknote className="w-5 h-5" />
              {isPending ? 'Elaborazione...' : 'Preleva Incasso'}
            </button>
          </div>
        )}

        {/* COLONNA SINISTRA (Form) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            {!isConnected ? (
              <div className="text-center flex flex-col items-center py-8">
                <Wallet className="w-16 h-16 text-slate-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-3">Unisciti alla conversazione</h2>
                <p className="text-slate-400 mb-8">Collega il tuo wallet in alto a destra per sbloccare l'accesso al locale esclusivo.</p>
              </div>
            ) : !isVip ? (
              <div className="text-center flex flex-col items-center py-8 relative z-10">
                <Lock className="w-16 h-16 text-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                <h2 className="text-2xl font-bold text-white mb-3">Accesso Negato</h2>
                <p className="text-slate-400 mb-8">Non possiedi la tessera VIP. Conia il tuo NFT gratuito per sbloccare il modulo.</p>
                <button onClick={handleMint} disabled={isPending} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50">
                  <Ticket className="w-5 h-5" /> {isPending ? 'Transazione...' : 'Conia il VIP Pass'}
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <Unlock className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Scrivi un messaggio</h2>
                </div>
                <form onSubmit={handleSendMessage} className="flex flex-col gap-5">
                  <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Il mondo ti ascolta..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 resize-none h-32" required />
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-yellow-500" /> Donazione (ETH)</label>
                    <input type="number" step="0.001" value={tipInput} onChange={(e) => setTipInput(e.target.value)} className="w-full bg-transparent text-white text-lg focus:outline-none font-mono" />
                  </div>
                  <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold disabled:opacity-50 mt-2">
                    <Send className="w-5 h-5" /> {isPending ? 'Firma in corso...' : 'Pubblica'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA (Bacheca) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" /> Ultimi Messaggi
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {displayMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white/5 border border-dashed border-white/10 rounded-3xl"><p>Nessun messaggio trovato.</p></div>
            ) : (
              displayMessages.map((msg) => (
                (isAdmin || !msg.isHidden) && (
                  <div key={msg.originalIndex} className={`bg-white/5 border ${msg.isHidden ? 'border-red-500/50 opacity-60' : 'border-white/10'} p-6 rounded-2xl hover:bg-white/10 transition-colors`}>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                          <span className="font-mono text-xs font-bold text-white">0x</span>
                        </div>
                        <span className="font-mono text-sm text-slate-300 font-medium tracking-wide">
                          {msg.author.slice(0,6)}...{msg.author.slice(-4)}
                        </span>
                        {msg.isHidden && <span className="text-xs text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">NASCOSTO</span>}
                      </div>
                      {Number(msg.tipAmount) > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                          <Award className="w-3.5 h-3.5" /> {formatEther(msg.tipAmount)} ETH
                        </div>
                      )}
                    </div>
                    
                    <p className="text-lg text-slate-200 leading-relaxed font-light mb-6">
                      {msg.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button 
                        onClick={() => handleUpvote(msg.originalIndex)}
                        disabled={isPending || !isVip}
                        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:hover:text-slate-400 group"
                      >
                        <ThumbsUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> 
                        {Number(msg.upvotes)} Voti
                      </button>

                      {isAdmin && (
                        <button 
                          onClick={() => handleToggleVisibility(msg.originalIndex)}
                          disabled={isPending}
                          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                        >
                          {msg.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {msg.isHidden ? 'Mostra' : 'Nascondi'}
                        </button>
                      )}
                    </div>

                  </div>
                )
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;