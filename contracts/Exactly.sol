// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Exactly is ERC721URIStorage {
    constructor() ERC721("Exactly", "EXC") {}
}
