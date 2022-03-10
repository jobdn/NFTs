//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract ERC721 is Context, ERC165, IERC721, IERC721Metadata {
    string private _name;
    string private _symbol;

    mapping(uint256 => address) public _owners;
    mapping(address => uint256) public _balances;
    mapping(uint256 => address) public _tokenApprovals;
    mapping(address => mapping(address => bool)) public _operatorApprovals;
    mapping(uint256 => string) private _metadatas;
    uint256 counter = 1;

    constructor(string memory name, string memory symbol) {
        _name = name;
        _symbol = symbol;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _metadatas[tokenId];
    }

    // =========================
    // Internal
    function _isApprovalForAll(address owner, address operator) internal view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function _getApproved(uint256 tokenId) internal view returns (address) {
        return _tokenApprovals[tokenId];
    }

    function _exists(uint tokenId) internal view returns (bool){
        return _owners[tokenId] != address(0);
    }

    function _isApprovalOrOwner(address sender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);

        return (sender == owner || 
            _getApproved(tokenId) == sender || 
            _isApprovalForAll(owner, sender)
        );
    }

    function _transfer(
        address from, 
        address to, 
        uint256 tokenId
    ) 
        internal
    {
        require(ownerOf(tokenId) == from, "Owner has not token with this id");
        require(to != address(0), "to address is equal to 0");

        approve(address(0), tokenId);

        _balances[from]--;
        _balances[to]--;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }
    // =========================

    function balanceOf(address owner) public override view returns (uint256) {
        require(owner != address(0), "Zero owner address");
        return _balances[owner];
    }
    function ownerOf(uint256 tokenId) public override view returns (address) {
        require(_exists(tokenId), "Nonexistent token");
        return _owners[tokenId];
    }

    function approve(address approved, uint256 tokenId) public override {
        require(_msgSender() != approved, "Sender is approved");
        require(_msgSender() == _owners[tokenId], "Sender is not owner");
        require(_isApprovalForAll(_msgSender(), approved), "Sender is not operator");

        _tokenApprovals[tokenId] = approved; 
        emit Approval(_msgSender(), approved, tokenId);
    }

    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId, 
        bytes memory data
    ) 
        public
        override 
    {
        safeTransferFrom(from, to, tokenId, "");
        data;
    }

    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId
    ) 
        public
        override
    {
        require(_isApprovalOrOwner(_msgSender(), tokenId), "Not owner or approval");
        _transfer(from, to, tokenId);

        // to do safely by _checkOnERC721Received()
    }

    function transferFrom(
        address from, 
        address to, 
        uint256 tokenId
    ) 
        public 
        override
    {
        require(_isApprovalOrOwner(_msgSender(), tokenId), "Not owner or approval");
        _transfer(from, to, tokenId);
    }

    function setApprovalForAll(
        address operator, 
        bool approved
    ) 
        public
        override  
    {
        require(_msgSender() != operator, "Sedner is operator");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function getApproved(uint256 tokenId) public view override returns (address) {
        return _getApproved(tokenId);
    }
    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _isApprovalForAll(owner, operator);
    }

    function mint(address owner, string memory _tokenURI) public {
        require(owner != address(0), "owner is equal to 0");

        _owners[counter] = owner;
        _balances[owner]++;
        _metadatas[counter] = _tokenURI;

        emit Transfer(address(0), owner, counter);

        counter++;
    }

    function burn(uint256 tokenId) public {
        require(_isApprovalOrOwner(_msgSender(), tokenId));

        approve(address(0), tokenId);
        delete _owners[tokenId];
        _balances[_msgSender()]--;

        emit Transfer(_msgSender(), address(0), counter);
    }
}
