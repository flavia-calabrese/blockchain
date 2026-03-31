// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// interfaccia NFT: spiega al contratto come comunicare con un contratto NFT esterno
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract AdvancedGuestbook {

    // global state variable
    address public admin;
    IERC721 public requiredNFT; // address of the NFT contract that users must own to sign the guestbook

    struct Message {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 upvotes;
        uint256 tipAmount; // total tips received for this message
        bool isHidden; // flag to indicate if the message is hidden by the admin
    }

    Message[] public messages;

    // events to update the frontend
    event NewMessage(uint256 indexed id, address indexed author, string content, uint256 tipAmount);
    event MessageUpvoted(uint256 indexed id, address indexed voter, uint256 newUpvotes);
    event MessageHidden(uint256 indexed id);

    // rule to protect admin-only functions 
    modifier onlyAdmin() {
        require(msg.sender == admin, "Denied Accesses: only admin can do this action");
        _;
    }

    constructor(address _nftAddress) {
        admin = msg.sender; // Chi fa il deploy diventa l'amministratore
        
        // Se passiamo un indirizzo valido al deploy, attiviamo il Token Gating
        if (_nftAddress != address(0)) {
            requiredNFT = IERC721(_nftAddress);
        }
    }

    function leaveMessage(string memory _content) public payable {
        require(bytes(_content).length > 0 && bytes(_content).length <= 280, "Message content cannot be empty or too long");

        if(address(requiredNFT) != address(0)) {
            require(requiredNFT.balanceOf(msg.sender) > 0, "You must own the required NFT to sign the guestbook");
        }

        uint256 messageId = messages.length;

        messages.push(Message({
            id: messageId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            upvotes: 0,
            tipAmount: msg.value, // inizializziamo il tipAmount con l'importo inviato al momento della pubblicazione del messaggio
            isHidden: false
        }));

        emit NewMessage(messageId, msg.sender, _content, msg.value);
    }


    // upvote a message, anybody can upvote
    function upvoteMessage(uint256 _id) public {
        require(_id < messages.length, "Invalid message ID");
        require(!messages[_id].isHidden, "Cannot upvote a hidden message");

        messages[_id].upvotes++;

        emit MessageUpvoted(_id, msg.sender, messages[_id].upvotes);
    }

    function hideMessage(uint256 _id) public onlyAdmin {
        require(_id < messages.length, "Invalid message ID");
        require(!messages[_id].isHidden, "Message is already hidden");

        messages[_id].isHidden = true;

        emit MessageHidden(_id);
    }

    // quando gli utenti mandano i tips, questi vengono accumulati nel contratto. 
    // L'admin può prelevarli quando vuole con questa funzione
    function withdrawTips() public onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No tips to withdraw");

        (bool success, ) = admin.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getAllMessages() public view returns (Message[] memory) {
        return messages;
    }

}