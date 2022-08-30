require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage")
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");     //superset fork of 'hardhat-deploy-ethers'

/** @type import('hardhat/config').HardhatUserConfig */


const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby/example"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"                   // from Metamask
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"
module.exports = {
  // detalutNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL || "",
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 1,                      // this gives etherscan a chance to catchup to start verification
    },                                            // local network only does 1 block confirmaiton after transactoin
    localhost: {
      url: "http://127.0.0.1:8545",               // modify after running - yarn hardhat node
      // Accounts: Provided by hardhat                               
      chainId: 31337,                             // same as hardhat
    },
  },
  // solidity: "0.8.8",
  solidity: {
    compilers: [{
      version: "0.8.8"
    }, {
      version: "0.6.6"
    }]
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,                              //enable when needed
    outputFile: "gas-reporter.txt",
    noColors: true,                             // colors messes it up
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    // token: "MATIC"                              // Default is ETH, if 'Polygon' network is needed, then we go with MATIC
  },
  namedAccounts: {
    deployer: {
      default: 0,                                 // by default, 0th account would be 'deployer'
    },
    user: {
      default: 1,                                  // as an example if user is needed for testing.
    }
  }
};