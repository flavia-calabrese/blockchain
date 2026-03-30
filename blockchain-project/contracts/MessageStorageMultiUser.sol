// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageStorage {
    
    // 1. IL MAPPING: Associa ogni indirizzo utente al suo messaggio specifico
    // Immaginalo come un dizionario o un foglio Excel a due colonne. 
    // Nella prima colonna c'è l'indirizzo Ethereum dell'utente (la chiave), 
    // nella seconda c'è il testo che ha salvato (il valore).
    mapping(address => string) private userMessages;

    // 2. SCRITTURA: Salva il messaggio nello scompartimento di chi chiama la funzione
    function setMessage(string memory _message) public {
        // msg.sender è l'indirizzo di chi sta eseguendo la transazione in questo istante
        userMessages[msg.sender] = _message;
    }

    // 3. LETTURA PERSONALE: Legge il messaggio di chi sta chiamando la funzione
    function getMessage() public view returns (string memory) {
        return userMessages[msg.sender];
    }

    // 4. LETTURA PUBBLICA (Opzionale): Permette di leggere il messaggio di un utente specifico
    function getMessageOf(address _user) public view returns (string memory) {
        return userMessages[_user];
    }
}