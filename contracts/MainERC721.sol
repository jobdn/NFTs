// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MainERC721 is ERC721{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    mapping(uint256 => string) metadatas;
    mapping(string => bool) existingMetadatas;
    string private constant baseURI = "https://ipfs.io/ipfs/"; 

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function mint(address owner, string memory metadata) public returns (uint) {
        _tokenIds.increment();
        require(!metadataIsExists(metadata), "Token with this metadata already exists");
        _safeMint(owner, _tokenIds.current());

        metadatas[_tokenIds.current()] = metadata; 
        existingMetadatas[metadata] = true;

        return _tokenIds.current();
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "You cannot burn this token");
        _burn(tokenId);

        string memory metadata = metadatas[_tokenIds.current()]; 
        metadatas[_tokenIds.current()] = ""; 
        existingMetadatas[metadata] = false;
    }

    function metadataIsExists(string memory metadata) internal view returns (bool) {
        return existingMetadatas[metadata];
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        require(_exists(tokenId), "Token with this id doesn't exist");
        return string(abi.encodePacked(_baseURI(), metadatas[tokenId]));
    }

    function _baseURI() internal pure override returns (string memory) {
        return baseURI;
    }
}