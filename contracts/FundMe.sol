// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//Error Codes
error FundMe__NotOwner(); //saves gas fee this way. function is not created and can be named anthing.

//Interfaces, Libraries, Contracts

/** @title A contract for crowd funding
 * @author Tyrel Succar
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256; // Solidity strongly typed, multiple lines for each types.

    // State Variables
    mapping(address => uint256) private s_addressToAmountFunded; // s_ for storage indenfier
    address[] private s_funders;
    // Could we make this constant?  /* hint: no! We should make it immutable! */
    // 21,508 gas - immutable
    // 23,644 gas - non-immutable
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    // 21,415 gas * 141000000000 = $9.058545 constant
    // 23,515 gas * 141000000000 = $9.946845 non-constant
    // instead of these being stored in STORAGE, they are actually stored in BYTECODE of the contract

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _; //< what was this for ?                          //lines of code AFTER will not be executed.
    }

    //constructor is function that get automatically executed gimmeidately after deployment of the contract
    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    fallback() external payable {
        //special function => more info below
        fund();
    }

    receive() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // reset the array
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);   //if fails,sends error
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);  // needs require to revert
        // require(sendSuccess, "Send failed");
        // call
        // payable(msg.sender).call("")         // ("") this is where we'll put any function information about some other contract.
        // it's lower level command, used to call any function without ever having the ABI
        // here we don't want to leave it empty.

        // @dev https://solidity-by-example.org/sending-ether/
        //
        //You can send ETHER to other contracs by:
        // transfer (2300 gas, throws error)        //capped at 2300 and throws error more gas is needed.
        // send (2300 gas, returns bool)            // it would not revert the transaction if it fails unless require is used
        // call (forward all gas or set gas, returns bool) // not capped
        //
        //A contract receiving ETHER must have at least one of the functions below
        //
        // receive() external payable
        // fallback() external payable

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(""); // here we don't want to leave it empty.
        require(callSuccess, "Call failed");
    }

    // above, Send to whomever called the withdraw() function [in this case - msg.sender], pay to msg.sender, from the contract
    // address - address(this).balance. "this" refers to the whole contract. "balance" is the native ethereum blockchain datbase balance.
    // We need to "TypeCasst" - 'msg.sender' from address to payable.
    // msg.sender = address type
    // payable (msg.sender) - payable address type
    // In Solidity, in order to send NATIVE BLOCKCHAIN like ETHEREUM, only work with PAYABLE address to do that
    // Therefore, Send money to [payble(msg.sender)] This ammount [.call{value:ddress(this).balance}] from [this] contract, at [balance] pocket.

    // Below receive() special function triggered as long as incoming fund has NO associated CALLDATA (what are functions) but just fund value, even if value=0,
    // it creats a transaction.
    // These functions are actually the contract functions, called using a CALL function in CALLDATA. evertime we use
    // the remix function buttons, it's sending a call function.
    // However, if some data (0x00) is sent over CALLDATA, then Solidity is trying to look for that function, if it doesn't find it
    // it will look for "Fallback function"

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    // The whole effort below is to capture scenario where someone is trying to send us (the contract) money directly instead of
    // call the fund function correctly
    function cheaperWithdraw() public payable onlyOwner {
        // make it cheaper by copying to memory as opposed to reading from storage each time
        address[] memory funders = s_funders;
        //mappings can't be in memory only arrays.  //solidity won't let you do it right now
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // getters for private variables above
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
