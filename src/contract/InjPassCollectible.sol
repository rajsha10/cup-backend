// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Minimal ERC721 + ERC20 interfaces for inEVM deployment
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract InjPassCollectible {
    string public name = "InjPass World Cup Collectibles";
    string public symbol = "INJPASS";

    struct TicketMetadata {
        string eventId;
        uint256 seatNumber;
        string baseUri;      // Points to cinematic asset metadata
        bool isValidated;
        bool teamWon;        // Dynamic condition updated post-match
    }

    IERC20 public usdcToken;
    address public admin;
    uint256 public nextTokenId;

    mapping(uint256 => TicketMetadata) public ticketRegistry;
    mapping(uint256 => address) public tokenOwners;
    mapping(address => uint256) public balances;

    event TicketPurchased(uint256 indexed tokenId, address indexed buyer, string eventId);
    event TicketCheckedIn(uint256 indexed tokenId);
    event MetadataUpgraded(uint256 indexed tokenId, string newUri);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "InjPass: Only admin agent allowed");
        _;
    }

    // Constructor with default zero-address USDC fallback (No required arguments for instant Remix deployment)
    constructor() {
        usdcToken = IERC20(address(0));
        admin = msg.sender;
    }

    // Set USDC token address post-deployment if needed
    function setUsdcToken(address _usdcToken) public onlyAdmin {
        usdcToken = IERC20(_usdcToken);
    }

    // Transfer admin role to AI Agent wallet
    function setAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "InjPass: Invalid address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    // Purchase via CCTP Bridged USDC (with zero-price / testnet fallback)
    function purchaseTicket(
        string memory _eventId, 
        uint256 _seatNumber, 
        uint256 _price, 
        string memory _initialUri
    ) public {
        if (_price > 0 && address(usdcToken) != address(0)) {
            require(usdcToken.transferFrom(msg.sender, address(this), _price), "USDC transfer failed");
        }

        uint256 tokenId = nextTokenId;
        ticketRegistry[tokenId] = TicketMetadata({
            eventId: _eventId,
            seatNumber: _seatNumber,
            baseUri: _initialUri,
            isValidated: false,
            teamWon: false
        });

        tokenOwners[tokenId] = msg.sender;
        balances[msg.sender] += 1;
        nextTokenId++;

        emit TicketPurchased(tokenId, msg.sender, _eventId);
    }

    // Called by the Turnstile Validator Agent via MCP
    function validateGateEntry(uint256 _tokenId) public onlyAdmin {
        require(!ticketRegistry[_tokenId].isValidated, "InjPass: Already checked in");
        ticketRegistry[_tokenId].isValidated = true;
        
        emit TicketCheckedIn(_tokenId);
    }

    // Triggered post-match by the Fan Engagement Agent if their team wins
    function upgradeToVictoryMetadata(uint256 _tokenId, string memory _victoryUri) public onlyAdmin {
        ticketRegistry[_tokenId].teamWon = true;
        ticketRegistry[_tokenId].baseUri = _victoryUri;
        
        emit MetadataUpgraded(_tokenId, _victoryUri);
    }

    // Standard ERC721 View Helpers
    function ownerOf(uint256 _tokenId) public view returns (address) {
        address owner = tokenOwners[_tokenId];
        require(owner != address(0), "InjPass: Nonexistent token");
        return owner;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        require(tokenOwners[_tokenId] != address(0), "InjPass: Nonexistent token");
        return ticketRegistry[_tokenId].baseUri;
    }
}