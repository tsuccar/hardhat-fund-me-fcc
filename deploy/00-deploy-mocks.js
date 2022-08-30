const { network } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    console.log(`ChainID : ${chainId}`)
    console.log(`Natework Name:${network.name}`)
    console.log(`deployer ${deployer}`)
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {                              //just a logging name.
            contract: "MockV3Aggregator",                               // artifact file name
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],   // goes into constructor of "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";     
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"] // when deloyed, you can do $yarn hardhat deploy --tags mocks