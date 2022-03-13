// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CarsERC1155 is ERC1155, AccessControl {
    // mapping(uint256 => string) private _uris;
    mapping(uint256 => bytes) private _uris;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory mainURI) ERC1155(mainURI) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
    }

    function mint(
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        require(hasRole(MINTER_ROLE, msg.sender), "You cannot mint tokens");
        _mint(msg.sender, id, amount, data);
        setURI(id, data);
    }

    function mintBatch(
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes[] memory datas
    ) public {
        require(hasRole(MINTER_ROLE, msg.sender), "You cannot mint tokens");
        require(
            ids.length == amounts.length && ids.length == datas.length,
            "ids length, datas length and amounts length must mutch"
        );

        for (uint256 i = 0; i < ids.length; i++) {
            _mint(msg.sender, ids[i], amounts[i], datas[i]);
            _uris[ids[i]] = datas[i];
        }
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) public {
        require(hasRole(BURNER_ROLE, msg.sender), "You cannot burn tokens");
        _burn(from, id, amount);

        if (balanceOf(from, id) == 0) {
            setURI(id, "");
        }
    }

    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(hasRole(BURNER_ROLE, msg.sender), "You cannot burn tokens");
        _burnBatch(from, ids, amounts);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return string(_uris[id]);
    }

    // function setURI(uint256 id, string memory data) private {
    function setURI(uint256 id, bytes memory data) private {
        _uris[id] = data;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
