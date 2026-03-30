// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DecentralizedGuestbook {

    // Struct to represent a message in the guestbook
    struct Message {
        // Address of the message author
        address author;
        string content;
        uint256 timestamp;
    }

    // Array to store all messages in the guestbook
    Message[] public messages;

    // Event emitted when a new message is left in the guestbook
    event newMessage(address indexed author, string content, uint256 timestamp);

    // Function to leave a message in the guestbook
    function leaveMessage(string memory _content) public {
        // Validate message content
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 280, "Content too long, max 280 characters");

        Message memory newMsg = Message({
            author: msg.sender,
            content: _content,
            // Use block.timestamp to record the time the message was left
            timestamp: block.timestamp
        });

        messages.push(newMsg);
        emit newMessage(msg.sender, _content, block.timestamp);
    }

    // Function to retrieve all messages
    function getAllMessages() public view returns (Message[] memory) {
        return messages;
    }

}