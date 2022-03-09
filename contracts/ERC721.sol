//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
balanceOf(owner)
ownerOf(tokenId)

safeTransferFrom(from, to, tokenId)
safeTransferFrom(from, to, tokenId, data)
transferFrom(from, to, tokenId)

approve(to, tokenId)
getApproved(tokenId)
setApprovalForAll(operator, approved)
isApprovedForAll(owner, operator)
 */

contract ERC721 is Context{
    string public _name;
    string public _symbol;

    mapping(uint256 => address) public _owners;
    mapping(address => uint256) public _balances;
    mapping(uint256 => address) public _tokenApprovals;
    mapping(address => mapping(address => bool)) public _operatorApprovals;
    mapping(uint256 => string) public _metadatas;
    uint256 counter;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed from,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed from,
        address indexed operator,
        bool approved
    );

    constructor(string memory name, string memory symbol) {
        _name = name;
        _symbol = symbol;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return _metadatas[tokenId];
    }

    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function isApprovedForAll(address owner, address operator)
        public
        view
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    function mint(address _ownerAddress, string memory _metadata) public {
        require(_ownerAddress != address(0), "Zero owner address");

        _balances[_ownerAddress]++;
        _owners[counter] = _ownerAddress;
        _metadatas[counter] = _metadata;
        emit Transfer(address(0), _ownerAddress, counter);

        counter++;
    }

    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approval to owner");
        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "Not owner or operator"
        );

        _tokenApprovals[tokenId] = to;

        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token with this id doesn't exist");
        return _tokenApprovals[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function approveForAll(
        address owner,
        address operator,
        bool approved
    ) public {
        require(owner != operator, "Approve to caller");

        _operatorApprovals[owner][operator] = approved;

        emit ApprovalForAll(owner, operator, approved);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not approved or owner"
        );
        _transfer(from, to, tokenId);
        // TODO: to do safety
        // require(...);
    }


    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(from == ownerOf(tokenId), "Not owner");
        require(to != address(0), "Cannot transfer to zero address");

        approve(address(0), tokenId);
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not approved or owner"
        );
        _transfer(from, to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        require(_exists(tokenId), "Nonexistent token");
        address owner = _owners[tokenId];
        return (owner == spender ||
            isApprovedForAll(owner, spender) ||
            spender == getApproved(tokenId));
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(_msgSender() != operator, "Caller is operator");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }
}
