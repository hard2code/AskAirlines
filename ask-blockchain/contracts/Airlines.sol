

pragma solidity  ^0.5.0 ;

contract Airlines {

    address payable owner; //owner act as escrow with a wallet
    //address payable wallet;
    mapping(address => uint256) balanceOf;


     modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    event paid(address indexed buyer, uint256 amount);
    event available(address indexed airline,uint256 seatNumber);
    event requestChange(
        address indexed airline,
        address changeTo,
        uint256 seatNumber
        );
    event Sent(address from, address to, uint amount);

     struct AirlinesDetails {
         uint256 _id;
         uint256 _balance;

     }
     mapping(address => AirlinesDetails) public airlinesInfo;

     function() external payable{
        msg.sender.transfer(msg.value);
    }
//constructor here
    constructor (uint256 initialSupply) public{
        owner = msg.sender; //contract owner and escrow
        balanceOf[owner] = initialSupply; //token supply
    }

    function _transfer(address _to, uint256 _value) internal {
        require(balanceOf[msg.sender] >= _value);
        require(balanceOf[_to] + _value >= balanceOf[_to]);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Sent(msg.sender, _to, _value);
    }




   //1. Register
   function register() public payable{
       require(msg.value > 0);
       //register Airline
        airlinesInfo[msg.sender]._id += 1;
        airlinesInfo[msg.sender]._balance = msg.value;
    // register Airline and the owner will hold the money
        balanceOf[msg.sender] += msg.value; //add amount token to buyer balance
        //send ether to owner wallet
        owner.transfer(msg.value);
        emit paid(msg.sender,msg.value);

   }

// //2. Request
     function request (address toAirline, uint256 seat) public{
         address fromAirline = msg.sender;
         //hashOfDetails can be the seat number
         emit requestChange(fromAirline,toAirline, seat);

     }

 //3. Response
     function response(address fromAirline,uint256 seat, bool done)
     public
     payable
     returns(bool success){
       // done is the confirmation from off-chain that the seat is available or not
        if(done == true){
           emit available(fromAirline,seat);
           return true;
        }
        else{
           return false;
        }

     }

// //4. SettlePayment
     function payToAirline(address payable toAirline) public payable {
         //call transfer where _to is toAirline and pay from msg.sender
         toAirline.transfer(msg.value);
         _transfer(toAirline,balanceOf[msg.sender]);

     }
// //5. Unregister
    function unregister(address payable Airline) public payable onlyOwner(){
      // take to money from airline by taking out their token balance and revert
      //and return the msg.value to that address
            require(balanceOf[Airline] > 0);
            require(balanceOf[owner] > 0);
            uint refund = airlinesInfo[Airline]._balance;
            Airline.transfer(refund);
            balanceOf[owner] -= balanceOf[Airline];
            airlinesInfo[Airline]._balance = 0;
            balanceOf[Airline] = 0;

    }


//6. BalanceDetails (public - more for debugging purposes)

    function BalanceDetails(address Airline)
    public
    view
    returns(uint256 airlineBalance,
            uint256 escrowBalance,
            uint256 walletBalance){
        return (balanceOf[Airline],owner.balance,balanceOf[owner]);
    }


}
