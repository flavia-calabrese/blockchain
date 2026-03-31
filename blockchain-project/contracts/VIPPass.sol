// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Importiamo lo standard sicuro per gli NFT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VIPPass is ERC721 {
    uint256 public nextTokenId;

    constructor() ERC721("VIP Guestbook Pass", "VIP") {}

    function mint() public {
        uint256 tokenId = nextTokenId;
        // _safeMint assegna l'NFT all'indirizzo di chi chiama la funzione
        _safeMint(msg.sender, tokenId);
        nextTokenId++;
    }
}