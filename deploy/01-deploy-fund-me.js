// Here instead of :
//import
// main function
// calling of main function
// here we go with : "hardhat-deploy will pass an "HRE object"" this export function.
//  { getNamedAccounts, deployments } = hre
// function deployfunc() {
//     console.log()
// }
// module.exports.default = deployfunc
//--------------------------------------------------
// https://github.com/wighawag/hardhat-deploy#deploy-scripts

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
// const helperConfig = require ("../helper-hardhat-config")
// const networkConfig = require   helperConfig.networkconfig


// module.exports  = async(hre) => {
//     const {getNamedAccounts, deployments} = hre
//     //hre.getNamedAccounts
//     //hre.deployments

module.exports = async ({ getNamedAccounts, deployments }) => {        //javascript synthatic sugar, extrapolation

    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId                            // comes from the command line --network

    // if chainId is X use address Y
    // if chainId is Z use address A

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        // const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        const ethUsdAggregator = await get("MockV3Aggregator")             // contract already deployed
        ethUsdPriceFeedAddress = ethUsdAggregator.address                  // its address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]    // looks up the Feed address for what enterd above
    }

    // !! if the contract doesn't exist, we deploy a minimal version of it
    // for our local testing !!


    //what happens when we to change chains (EVM chains - eth bnb polygon - https://docs.chain.link/docs/reference-contracts/)
    // we need to parameterize the static values.
    //when goin for localhost or hardhat network, we want to use a mock

    //  TO DEPLOY 
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {                 // Name & List of Overwrites
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, // waiting for a live network, in hardhat.config.js

    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&            //b/c we don't want to verify on local network.
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}
module.exports.tags = ["all", "fundme"]

// As you can see the HRE passed in has 4 new fields :

// [getNamedAccounts] is a function that returns a promise to an object whose keys are names and values are addresses. It is parsed from the namedAccounts configuration (see namedAccounts).

// [getUnnamedAccounts] is a function that return a promise to an array of accounts which were not named (see namedAccounts). It is useful for tests where you want to be sure that the account has no speicifc role in the system (no token given, no admin access, etc...).

// [getChainId] is a function which return a promise for the chainId, as convenience

// [deployments] is an object which contains functions to access past deployments or to save new ones, as well as helpers functions.