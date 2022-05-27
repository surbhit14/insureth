// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract CovalentAPIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;
  
    uint256 public price;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    /**
     * Network: Kovan
     * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink Devrel   
     * Node)
     * Job ID: d5270d1c311941d0b08bead21fea7747
     * Fee: 0.1 LINK
     */
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    
    function getETHPrice() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request using the Covalent API
        request.add("get", "https://api.covalenthq.com/v1/42/address/0xD1D50a78A6cdb91f0109D4C439580d00f26781e6/balances_v2/?key=ckey_1231e418207f49a99fe5676b1a0");
				
        string[] memory path = new string[](4);
        path[0] = "data";
        path[1] = "items";
        path[2] = "0";
        path[3] = "quote_rate";
        request.addStringArray("path", path);
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId)
    {
        price = _price/1000;
    }

    event Deposited(address depositer,uint qty,uint price_at_deposit,uint time_deposited);
    event Withdrawn(address withdrawer,uint refund_amount,uint price_at_withdraw);
    //current price (in USD) * quantity
    //1year-10%
    //3year-20%
    //5year-30%
    mapping(address => uint) public balances;
    mapping(address => uint) public deposit_price;
    mapping(address => uint) public percentage;
    mapping(address => uint) public withdraw_time;

    function deposit(uint amount,uint numberOfYears) public payable
    {   
        // require((msg.value)*1e18 == amount);
        require((msg.value) == amount);
        bytes32 r=getETHPrice();
        deposit_price[msg.sender]=price;
        uint fee=amount/10; 
        balances[msg.sender]=msg.value-fee;
        uint p=10;
        if(numberOfYears==3)
            p=20;
        else if(numberOfYears==5)
            p=30;
        percentage[msg.sender]=p;
        uint deadline = block.timestamp + (numberOfYears * 365 days);
        withdraw_time[msg.sender]=deadline;
        emit Deposited(msg.sender,msg.value,price,deadline);

    }

    function withdraw() public {
        require(balances[msg.sender]>0);
        require(block.timestamp >= withdraw_time[msg.sender]);
        bytes32 r=getETHPrice();
        uint refund=0;
        if(price<deposit_price[msg.sender])
            refund=((deposit_price[msg.sender]-price)/1e18)*balances[msg.sender];
        // address to=payable(msg.sender);
        uint amt=balances[msg.sender]+refund;
        (bool sent, ) = msg.sender.call{value: amt}("");
        // to.transfer(amt);
        balances[msg.sender]=0;
        emit Withdrawn(msg.sender,refund,price);
    }
}