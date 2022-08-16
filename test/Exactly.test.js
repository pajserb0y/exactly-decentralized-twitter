const { expect, assert } = require("chai")
const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains
    ? describe.skip
    : describe("Exactly Unit tests", function () {
          let exactly,
              deployer,
              user,
              URI = "someUri"
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
              })
              it("Shouldn't  let user select NFT which is not their own", async function () {
                  await exactly.mint(URI)
                  await exactly.connect(user).mint(URI)
                  await expect(exactly.connect(deployer).setProfile(2)).to.revertedWith(
                      "Exactly__NotOwner"
                  )
              })
          })

          describe("Tipping posts", function () {
              it("Should allow users to tip posts", async function () {})
          })

          describe("Withdrawals", function () {
              describe("Validations", function () {
                  it("Should revert with the right error if called too soon", async function () {})

                  it("Should revert with the right error if called from another account", async function () {})

                  it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {})
              })

              describe("Events", function () {})
          })
      })
