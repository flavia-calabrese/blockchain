// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageStorage_1 {

    /**
        Questa variabile rappresenta l'informazione che viene salvata permanentemente 
        e in modo indelebile sulla blockchain. Essendo pubblica,
        chiunque conosca l'indirizzo del contratto potrà visualizzarne il contenuto
    **/
    string public message;

    /// scrive sulla blockchain
    /**
    Modificare lo stato della blockchain ha un costo. 
    Pertanto, chiunque chiami questa funzione dovrà pagare una piccola tariffa
    in criptovaluta (chiamata comunemente "gas") ai validatori della rete per 
    elaborare l'operazione. **/
    function setMessage(string memory _message) public {
        message = _message;
    }

    /// legge (gratis)
    /**
    Utilizza la parola chiave view, la quale garantisce alla rete che la funzione 
    si limiterà a guardare i dati senza alterarli in alcun modo. */
    function getMessage() public view returns (string memory) {
        return message;
    }
}