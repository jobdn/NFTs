// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MainERC721 is ERC721, AccessControl {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    mapping(uint256 => string) metadatas;
    string private constant baseURI = "https://ipfs.io/ipfs/";
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
    }

    function mint(address _owner, string memory _metadata)
        public
        returns (uint256)
    {
        require(hasRole(MINTER_ROLE, msg.sender), "You cannot mint tokens");
        _tokenIds.increment();
        _safeMint(_owner, _tokenIds.current());

        setTokenURI(_tokenIds.current(), _metadata);

        return _tokenIds.current();
    }

    function burn(uint256 _tokenId) public {
        require(hasRole(BURNER_ROLE, msg.sender), "You cannot burn tokens");
        _setTokenURI(_tokenId, "");
        _burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "Token with this id doesn't exist");
        return string(abi.encodePacked(_baseURI(), metadatas[_tokenId]));
    }

    function _baseURI() internal pure override returns (string memory) {
        return baseURI;
    }

    function setTokenURI(uint256 _tokenId, string memory _metadata) public {
        _setTokenURI(_tokenId, _metadata);
    }

    function _setTokenURI(uint256 _tokenId, string memory _metadata) public {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Only admin can set token URI"
        );
        require(_exists(_tokenId), "Token with this id doesn't exist");
        metadatas[_tokenIds.current()] = _metadata;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
