import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import './App.css'
// Importa il file generato automaticamente dallo script di deploy di Hardhat
import contractConfig from './contractConfig.json'

const contractAddress = contractConfig.address
const contractABI = contractConfig.abi

function App() {
  const [account, setAccount] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  const connectWallet = async () => {
    if (!window.ethereum) {
      return alert('Please install MetaMask')
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
  }

  // Function to fetch messages from the smart contract
  const fetchMessages = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider)

    try {
      const messages = await contract.getAllMessages()
      setMessages(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage) return alert('Message cannot be empty')
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum)
    // Get the signer to send transactions
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    try {
      const tx = await contract.leaveMessage(newMessage)
      console.log('Transaction sent! Waiting for confirmation...')

      await tx.wait() // Aspetta che la rete validi la transazione
      console.log('Message sent successfully!')

    
      setNewMessage('') // Clear the input field after sending
      fetchMessages() // Refresh messages after sending to show the new message
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Fetch messages when the component mounts
  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Guestbook DApp</h1>
      
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected as: <strong>{account}</strong></p>
      )}
      <hr />

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="Write your message (max 280 chars)" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ width: "300px", padding: "5px" }}
        />
        <button onClick={sendMessage} disabled={!account}>Sign and Send</button>
      </div>

      <h2>Public Messages:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            <p><strong>Author:</strong> {msg.author}</p>
            <p><strong>Says:</strong> {msg.content}</p>
            {/* Convertiamo il timestamp della blockchain in una data leggibile */}
            <p><small>Date: {new Date(Number(msg.timestamp) * 1000).toLocaleString()}</small></p>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default App
