// describe ("FundMe",function() {    beforeEach() it() })

const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")  //HRE ~ hardhat
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {        // <- first describe is for the entire the contractor, next "FundMe" is just a description name
        let fundMe
        let deployer
        let mockV3Aggregator
        // const sendValue = "1000000000000000000"   //1 ETH  or  docs.ethers.io/v5/utils/display-logic/#utils-parseEther
        const sendValue = ethers.utils.parseEther("1")    // 1 ETH easier with zeross
        console.log("helloooo")
        beforeEach(async function () {
            //     // This function deployes "fundMe" contract using "hardhat-deploy"
            //     // Possible "hardhat" functions:
            //     // const accounts = await ethers.getSigners()  //comes from hardhat.config.js/networks:{accounts[..]}
            //     // const accountZero = accounts[0]
            //     // const { deployer } = await getNamedAccounts()

            deployer = (await getNamedAccounts()).deployer // equals to deployer = await getNamedAccounts(), deployer.deployer
            // {"deployer":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","user":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}
            console.log(`deployer ==> : ${deployer}`)
            await deployments.fixture(["all"])   // fixture deploys all scripts in /deploy folder with --tags.
            fundMe = await ethers.getContract("FundMe", deployer) //getContract gets recent deployed contract that we tell it.
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        })
        //constructor
        describe("constructor", function () {        // <--describe for what's in the contract. "constructor" is just a description name
            it("sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed()
                // console.log(`response is equal to: ${response}`)
                assert.equal(response, mockV3Aggregator.address)
            })
        })
        // fund
        describe("fund", async function () {
            it("Fails if you don't send enough ETH", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            it("updated the amount funded data structure", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)   // typeof resonse = object, 
                // console.log(`sendValue typeof ${typeof sendValue}`)
                // console.log(`response 1: ${response}`)
                // console.log(`response 1 typeof : ${typeof response}`)
                // console.log(`response 2 String : ${response.toString()}`)
                // console.log(`response 3 String typeof: ${typeof response.toString()}`)
                assert.equal(response.toString(), sendValue)   //toString is needed to convert BigNumber/object back to string.
            })
            it("Adds funder to array of getFunder", async function () {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunder(0)  // struggled with getFunder(0) syntax since it's an array. 
                assert.equal(funder, deployer)

            })
        })
        describe("withdraw", async function () {
            beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })
            it("withdraw ETH from a single founder", async function () {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address) //could have used ethers.provider but we are using the provider of the fundme contract, it doesn't really matter but the point is to get the getBlance()
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt          //you put a breakpoint here and investigate transactionReceipt to these variables
                // const gasCost = gasUsed * effectiveGasPrice                  // but they are bigNumbers
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //Assert
                assert.equal(endingFundMeBalance, 0)
                // assert.equal(startingFundMeBalance + startingDeploymentBalance, endingDeployerBalance)  
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
                //since startingFundMeBalance is BigNumber & we need to add gasCost.

            })
            it("allows us to withdraw with multiple getFunder", async function () {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await ethers.provider.getBalance(                   //missing in the video
                    fundMe.address
                )
                const endingDeployerBalance = await ethers.provider.getBalance(                 //missing in the video
                    deployer
                )

                // Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
                // Make sure that the fudners are reset properly.
                await expect(fundMe.getFunder(0)).to.be.reverted
                // Loop through and make sure the amount is zero.
                // delopyer is [0]
                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })
            it("only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]                    //because [0] is the deployer
                const attackerConnectedConctract = await fundMe.connect(attacker)
                await expect(attackerConnectedConctract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner") //latest version of Chia Matcher corrected syntax
            })
            // new cheaper withdraw function
            it("cheaperWithdraw testing ...", async function () {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await ethers.provider.getBalance(                   //missing in the video
                    fundMe.address
                )
                const endingDeployerBalance = await ethers.provider.getBalance(                 //missing in the video
                    deployer
                )

                // Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
                // Make sure that the fudners are reset properly.
                await expect(fundMe.getFunder(0)).to.be.reverted
                // Loop through and make sure the amount is zero.
                // delopyer is [0]
                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })

        })

    })
