// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error Exactly__NotOwner();
error Exactly__MustOwnNftToPost();
error Exactly__PostCanNotBeEmpty();
error Exactly__PostWithThatIdDoesntExist();
error Exactly__CanNotTipToYouself();
error Exactly__TipAmountIsNotEnough();

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
        setProfile(s_tokenCount);
        return s_tokenCount;
    }

    function setProfile(uint256 _tokenId) public {
        if (msg.sender != ownerOf(_tokenId)) revert Exactly__NotOwner();
        s_profileToTokenId[msg.sender] = _tokenId;
    }

    function uploadPost(string memory _postHash) external {
        if (balanceOf(msg.sender) <= 0) revert Exactly__MustOwnNftToPost();

        if (bytes(_postHash).length <= 0) revert Exactly__PostCanNotBeEmpty();

        s_postCount++;

        s_postCountToPost[s_postCount] = Post(s_postCount, _postHash, 0, payable(msg.sender));

        emit Exactly__PostCreated(s_postCount, _postHash, 0, payable(msg.sender));
    }

    function tipPost(uint256 _postId) external payable {
        if (_postId < 0 || _postId > s_postCount) revert Exactly__PostWithThatIdDoesntExist();

        if (msg.value <= 0) revert Exactly__TipAmountIsNotEnough();

        Post memory _post = s_postCountToPost[_postId];

        if (msg.sender == _post.author) revert Exactly__CanNotTipToYouself();

        _post.tipAmount = _post.tipAmount + msg.value;

        s_postCountToPost[_postId] = _post;

        _post.author.transfer(msg.value);

        emit Exactly__PostTipped(_postId, _post.hashContent, _post.tipAmount, _post.author);
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

    function getTokenIdForProfile(address profile) public view returns (uint256) {
        return s_profileToTokenId[profile]; //returns nftId for user
    }
}
