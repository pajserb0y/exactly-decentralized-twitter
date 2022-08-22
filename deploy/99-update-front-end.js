const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE =
    "../exactly-decentralized-twitter-frontend/src/contractData/contractAddresses.json"
const FRONT_END_ABI_FILE = "../exactly-decentralized-twitter-frontend/src/contractData/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        await updateContractAdresses()
        await updateAbi()
    }
}

async function updateContractAdresses() {
    const exactly = await ethers.getContract("Exactly")
    const currentAdresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))

    const chainId = network.config.chainId.toString()

    if (chainId in currentAdresses) {
        if (!currentAdresses[chainId].includes(exactly.address)) {
            currentAdresses[chainId].push(exactly.address)
        }
    } else {
        currentAdresses[chainId] = [exactly.address]
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAdresses))
    console.log("Written address")
}

async function updateAbi() {
    const exactly = await ethers.getContract("Exactly")
    fs.writeFileSync(FRONT_END_ABI_FILE, exactly.interface.format(ethers.utils.FormatTypes.json))
    console.log("Written abi")
}

module.exports.tags = ["all", "frontend"]
