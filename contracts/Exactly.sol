// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Exactly is ERC721URIStorage {
    uint256 private s_tokenCount;
    uint256 private s_postCount;

    // postCount -> post
    mapping(uint256 => Post) private s_postCountToPost;
    //profile address->nft id
    mapping(address => uint256) private s_profileToTokenId;

    struct Post {
        uint256 id;
        string hashContent; //IPFS address of post metadata
        uint256 tipAmount;
        address payable author;
    }

    event Exactly__PostCreated(
        uint256 id,
        string hashContent,
        uint256 tipAmount,
        address payable author
    );
    event Exactly__PostTipped(
        uint256 id,
        string hashContent,
        uint256 tipAmount,
        address payable author
    );

    constructor() ERC721("Exactly", "EXC") {}

    function mint(string memory _tokenURI) external returns (uint256) {
        s_tokenCount++;
        _safeMint(msg.sender, s_tokenCount);
        _setTokenURI(s_tokenCount, _tokenURI);
        return s_tokenCount;
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCount;
    }

    function getPostCount() public view returns (uint256) {
        return s_tokenCount;
    }

    function getPost(uint256 postCount) public view returns (Post memory) {
        return s_postCountToPost[postCount];
    }
}
