const { expect, assert } = require("chai")
const { deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains
    ? describe.skip
    : describe("Exactly Unit tests", function () {
          let exactly,
              deployer,
              user,
              URI = "someUri",
              postHash = "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
              tipFee = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              await deployments.fixture(["exactly"])
              exactly = await ethers.getContract("Exactly")
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
          })

          describe("Deployment", function () {
              it("Should set the right starting value of state variables", async function () {
                  expect((await exactly.getTokenCount()).toString()).to.equal("0")
                  expect((await exactly.getPostCount()).toString()).to.equal("0")
              })
          })

          describe("Minting profile pictureNFT", function () {
              it("Should track each minted NFT", async function () {
                  await exactly.mint(URI)
                  expect(await exactly.tokenURI(1)).to.equal(URI)
                  expect((await exactly.getTokenCount()).toString()).to.equal("1")
              })
          })

          describe("Setting profile picture", function () {
              it("Should let user select which NFT is their profile picture", async function () {
                  await exactly.mint(URI)
                  assert.equal(
                      (await exactly.getTokenIdForProfile(deployer.address)).toString(),
                      "1"
                  )
                  await exactly.mint(URI)
                  assert.equal(
                      (await exactly.getTokenIdForProfile(deployer.address)).toString(),
                      "2"
                  )
                  await exactly.setProfile(1)
                  assert.equal(
                      (await exactly.getTokenIdForProfile(deployer.address)).toString(),
                      "1"
                  )
              })
              it("Shouldn't let user select NFT which is not owned by them", async function () {
                  await exactly.connect(user).mint(URI)
                  await expect(exactly.connect(deployer).setProfile(1)).to.revertedWith(
                      "Exactly__NotOwner"
                  )
              })
          })
          describe("Uploading posts", function () {
              it("Should allow users to upload new posts if they have profile picture minted and post is not empty", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)
                  expect((await exactly.getPostCount()).toString()).to.equal("1")
                  expect((await exactly.getPost(1)).author).to.equal(deployer.address)
              })
              it("Shouldn't allow users to upload new posts if their post is empty", async function () {
                  await exactly.mint(URI)
                  await expect(exactly.uploadPost("")).to.revertedWith("Exactly__PostCanNotBeEmpty")
              })
              it("Shouldn't allow users to upload new posts if they don't have profile picture minted", async function () {
                  await expect(exactly.uploadPost(postHash)).to.revertedWith(
                      "Exactly__MustOwnNftToPost"
                  )
              })
              it("Should emit event when users upload new posts if they have profile picture minted and post is not empty", async function () {
                  await exactly.mint(URI)
                  expect(await exactly.uploadPost(postHash)).to.emit("Exactly__PostCreated")
              })
          })

          describe("Tipping posts", function () {
              it("Should allow users to tip posts if postId exists and value is grater then zero and tipper is not author of post", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)
                  const initAuthorBalance = await ethers.provider.getBalance(deployer.address)

                  expect(await exactly.connect(user).tipPost(1, { value: tipFee })).to.emit(
                      "Transfer"
                  )
                  expect((await exactly.getPost(1)).tipAmount.toString()).to.equal(
                      ethers.utils.parseEther("0.1").toString()
                  )
                  expect(await ethers.provider.getBalance(deployer.address)).to.equal(
                      initAuthorBalance.add(tipFee)
                  )
              })
              it("Should not allow users to tip posts if postId doesn't exists", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)

                  await expect(
                      exactly.connect(user).tipPost(2, { value: tipFee })
                  ).to.be.revertedWith("Exactly__PostWithThatIdDoesntExist")
              })
              it("Should not allow users to tip posts if value sent is zero or less", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)

                  await expect(exactly.connect(user).tipPost(1, { value: 0 })).to.be.revertedWith(
                      "Exactly__TipAmountIsNotEnough"
                  )
              })
              it("Should not allow users to tip posts if they are the author", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)

                  await expect(exactly.tipPost(1, { value: tipFee })).to.be.revertedWith(
                      "Exactly__CanNotTipToYouself"
                  )
              })
              it("Should emit event success when users tip posts if postId exists and value is grater then zero and tipper is not author of post", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)

                  expect(await exactly.connect(user).tipPost(1, { value: tipFee })).to.emit(
                      "Exactly__PostTipped"
                  )
              })
          })

          describe("Fetching all users Nfts and fetching all posts", function () {
              it("Should retrun all user Nfts", async function () {
                  await exactly.mint(URI)
                  await exactly.mint(URI)
                  expect((await exactly.getMyNfts()).map(String)).to.eql(["1", "2"]) //deep equal or memebrs comparison rather then object comparison
              })
              it("Should retrun all posts", async function () {
                  await exactly.mint(URI)
                  await exactly.uploadPost(postHash)
                  await exactly.uploadPost(postHash)
                  await exactly.uploadPost(postHash)

                  expect((await exactly.getAllPosts()).length).to.equal(3) //deep equal or memebrs comparison rather then object comparison
              })
          })
      })
