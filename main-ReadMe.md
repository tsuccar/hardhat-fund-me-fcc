https://hardhat.org/hardhat-runner/docs/config

#Start from FundMe.sol & PriceConverter.sol preliminary code in Lesson 4
- `yarn add --dev hardhat`
- `yarn hardhat`

#Install SOLHINT for Sol files. Performs linting for Solidity files.
- `yarn add --dev solhint`
- `yarn solhint --init`
- `yarn solhint contracts/*.sol`  - to run and check

#Install `dotenv`
- `yarn add --dev dotenv`

#Install PRETTIER 
- `yarn add --dev prettier`
#create .prettierrc , .prettierignore files and configure values

#Check Solidity Compiler version - `hardhat.config.js` - solidity: "0.8.8" for *.sol versions.

#Compile the *.sol files
`yarn hardhat compile`

In Remix, the following line was enought  for it to get it from Github/NPM import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"
In local code, we have to tell "hardhat" where to get @chainlink/contracts. we need to download it from NPM 
into the node_module. Hardhat is smart eought to know that `@chainlink/contracts` part of the import is in "node_module"

#Install `@chainlink/contracts` 
- `yarn add --dev @chainlink/contracts`


                ############        DEPLOYMENT          ################

[HARDHAT Deploy] 


[Step 1][Parameterize AggregatorV3Interface so other networks can be added]

#Enable MOCKING for => [ AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e ]  to simulate "contracts or interfaces" not available in "hardhat" or "localhost" like price feed we have in Rinkeby.
#deploying in 'Testnet' is a bit slow especially when developming, we need something quick and be able to quickly tiker with and change. Therefore, we need to conitue with our localhost or hardhat environment with MOCK interfaces.
#REFACTOR `FundMe.sol` & `PriceConeverter.sol` to [parmeterize]before compiling

#RE-COMPILE before deploying
- `yarn hardhat compile`

[Step 2][hardhat-deploy installation & Deploy-folder scripts]

#`hardhat-deploy` - is hardhat plugin for Replicable Deployments and Easy Testing, package to manage several deploy & test in one place
- `yarn add -dev hadhat-deploy`                                       // install
#Update `hardhat.config.js` file with "require("hardhat-deploy")      //adds deploy task in `yarn hardhat`
#ADDITIONALLY! - Installation for 'ethers.js' users needed below:
#Overwrite "hardhat-ethers" in @nomiclabs with "hardhat-deploy-ethers ethers"
#Install intructions https://github.com/wighawag/hardhat-deploy-ethers
`npm install --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers`
#This makes ethers remember all the contract deployments we make, In `package.json` you will see :

       "@nomiclabs/hardhat-ethers": "^2.0.0"  >> "@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers@^0.3.0-beta.13"

#Delete "/scripts/deploy.js" script file.
#Create "deploy" folder instead.                  //All scripts in this new folder will be run when we run `yarn hardhat deploy`

#Create `deploy/01-deploy-fund-me.js` and add deploy script
        - add functions that `hardhat-deploy` calls in this folder.
#Create `helper-hardhat-config.js` to catalogue chain network addresses.
#Create [ Mock Price Feed] `contracts\test\MockV3Aggregator.sol` to isolate it from production contract files:
        import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
#Update Solidity Compiler version in `hardhat.config.js`:
          solidity: { compilers: [{version: "0.8.8"}, {version: "0.6.6"}],

- `yarn hardhat compile` to test, if successful, [Mock Aggregator] is also compiled and found in "Artificats" folder
        /artifacts/@chainlink/contracts/src/v0.6/tests/Mock3Aggregator.sol

#Create `deploy/00-deploy-mocks.js` and write a script to deploy "Mock" contracts for network that are NOT "Mainnet or TestNet".
-  `yarn hardhat deploy --tags mocks` if we wanted to only Deploy the Mock contract
#Create `utils/verify.s` folder/file to hold common configs accros all deploy/*.js file functions to prevent repititiions.

                ############     RUNNING DEPLOYMENT COMMANDS  ################

        `yarn hardhat deploy`   looks into /Deploy folder and runs all the functions
                                /deploy/00-deploy-mocks.js
                                /deploy/01-deploy-fund-me.js
                                                ||
                                                \/
        `hardhat-deploy` passes 'HRE' as an argument to functions in /deploy   //HRE=hardhat ,these extenshions are due to the hardhat-deploy plugin, not original "hardhat"   
                                const hre = require('hardhat');
                                const {deployments, getNamedAccounts} = hre;  
                                                ||
                                                \/
        Leverages `helper-hardhat-config.js` for networkConfig [chainID] <=> Feed address mapping                     




- `yarn hardhat deploy`         //deploys as mocks because "network.name == hardhat ChainID 31337"
- if youdid `yarn hardhat node` //the local envirnment come sup with pre-loaded contract.  don't understand this part.

>> OUTPUT
        ➜  hardhat-fund-me-fcc$  yarn hardhat deploy                  
        yarn run v1.22.15
        warning package.json: No license field
        $ /Users/tyrelsuccar/Development/Languages/Ethereum-Solidity/FreeCodeCampDotOrg/hardhat-fund-me-fcc/node_modules/.bin/hardhat deploy
        Nothing to compile
        ChainID : 31337
        Natework Name:hardhat
        Local network detected! Deploying mocks...
        deploying "MockV3Aggregator" (tx: 0x48bdfdd64644a5dd70bcefa793bec388fd55ccc9e6c6b6e4988db8d5cafde888)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 569635 gas
        Mocks Deployed!
        ------------------------------------------------
        You are deploying to a local network, you'll need a local network running to interact
        Please run `npx hardhat console` to interact with the deployed smart contracts!
        ------------------------------------------------
        Deploying FundMe and waiting for confirmations...
        deploying "FundMe" (tx: 0x55c75df54b1ec48dd5f1e469af09df66a300bfb48e92412057dfb5b61e5be5c8)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 898438 gas
        FundMe deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
        ✨  Done in 1.27s.

- `yarn hardhat deploy --network rinkeby` 
        ➜  hardhat-fund-me-fcc yarn hardhat deploy --network rinkeby
        yarn run v1.22.15
        warning package.json: No license field
        $ /Users/tyrelsuccar/Development/Languages/Ethereum-Solidity/FreeCodeCampDotOrg/hardhat-fund-me-fcc/node_modules/.bin/hardhat deploy --network rinkeby
        Nothing to compile
        ChainID : 4
        Natework Name:rinkeby
        Deploying FundMe and waiting for confirmations...
        deploying "FundMe" (tx: 0xfdd7b32aafe8b3d87ea033fdb03126dc47a5ff34a44a67a5bfbdd0b7208a7757)...: deployed at 0x69e2B1aA949EC8345EaB5b819DF60b22f4ecAa2E with 898438 gas
        FundMe deployed at 0x69e2B1aA949EC8345EaB5b819DF60b22f4ecAa2E
        Verifying contract...
        Nothing to compile
        Successfully submitted source code for contract
        contracts/FundMe.sol:FundMe at 0x69e2B1aA949EC8345EaB5b819DF60b22f4ecAa2E
        for verification on the block explorer. Waiting for verification result...

        Successfully verified contract FundMe on Etherscan.
        https://rinkeby.etherscan.io/address/0x69e2B1aA949EC8345EaB5b819DF60b22f4ecAa2E#code
        ✨  Done in 105.57s.

- `yarn hardhat deploy --network rinkeby --tags fundme`



                         ############     DOCUMENTATION  ################


SOLIDITY STYLE GUIDE

NatSpec / Doxygen = Solidity Natural Language Specification

/** @title A contract for crowd funding
* @author Tyrel Succar
* @notice This contract is to demo a sample funding contract
* @dev This implements price feeds as our library
*/

The syntax above helps with documentation. https://docs.soliditylang.org/en/v0.5.10/natspec-format.html#documentation-output

Order of Layout
Layout contract elements in the following order:

1. Pragma statements
2. Import statements
3. Interfaces
4. Libraries
5. Contracts

Inside each contract, library or interface, use the following order:

1. Type declarations
2. State variables
3. Events
4. Modifiers
5. Functions

Function Orders:

1. Constructor
2. receive
3. fallback
4. external
5. public
6. internal
7. private
8. view / pure

                                 ############     TESTING (Unit testing) & Debuger ################                             

#Create `/test/unit/FundMe.test.js`
#Create `/test/staging`
`yarn hardhat test`    
`yarn hardhat coverage`   // " hardhat-coverage" module installed already  

visual studio "breakponts"
Solidity .sol contract files, you can import "import console.log" to display each line.

                                ###  Storage in Solidity  (Anybody can read any data on the blockchain) ###

#Clone a storage contract and deploy to test some memory usage example.
#contract in:
- hardhat-fund-me-fcc/contracts/exampleContracts/FunWithStorage.sol
#deploy script:
- hardhat-fund-me-fcc/deploy/99-deploy-storage-me.js
#take up the change to write a function that finds the storage slot of the arrays and mappings and find the data in those slots.

- `yarn hardhat deploy --tags storage`

                                ###########      Gas Optimization using storage knowledge ####################

in Compiled file : ByteCode, there is "Opcodes" : each Opcode represent as small peach in the bytecode
you can see them in hardhat/artificats/buildinfo/, they represent how much computational work it take to run our code/ gas is calculated is by these opcodes

 https://github.com/crytic/evm-opcodes - EVM Opcodes, shows us how much it costs for each opcode 

                                ############     TESTING (Staging testing) & Debuger ################  
- `yarn hardhat deploy --network rinkeby`     // deploy if not on Testnet already.
- `yarn hardhat test`                           // run "unit test" on hardhat network
- `yarn hardhat test --network rinkeby`


                                ############    Scripts/fund.js funds ETH on localhost ################  

- write a script to load up the contract with some ETH.
- `yarn hardhat node`  // deploy all the contracts with local node in one window
- `yarn hardhat run scripts/fund.js --network localhost`

                                ############    Adding Scripts to package.json ################  

Add the following in package.json

  "scripts": {
    "test": "hardhat test",
    "test:staging": "hardhat test --network rinkeby",
    "lint": "solhint 'contracts/*.sol'",
    "lint:fix": "solhint 'contracts/**/*.sol' --fix",
    "format": "prettier --write .",
    "coverage": "hardhat coverage"
  }

  - `yarn test`
  - `yarn test:staging`