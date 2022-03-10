// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract CarsERC1155 is ERC1155 {
    string constant mainURI =
        "https://ipfs.io/ipfs/Qmf4vjaiP44f36mhiK63eDEFECYqyX4voUPyk16QqcFxn6";
    mapping(uint256 => string) private _uris;

    constructor() ERC1155(mainURI) {}

    function mint(
        uint256 id,
        uint256 amount,
        string memory data
    ) public {
        bytes memory dataInBytes = bytes(data);
        _mint(msg.sender, id, amount, dataInBytes);
        setURI(id, data);
    }

    function mintBatch(
        uint256[] memory ids,
        uint256[] memory amounts,
        string memory data
    ) public {
        bytes memory dataInBytes = bytes(data);
        _mintBatch(msg.sender, ids, amounts, dataInBytes);
    }

    function burn(uint256 id, uint256 amount) public {
        _burn(msg.sender, id, amount);
    }

    function burnButch(uint256[] memory ids, uint256[] memory amounts) public {
        _burnBatch(msg.sender, ids, amounts);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _uris[id];
    }

    function setURI(uint256 id, string memory data) private {
        _uris[id] = data;
    }
}
