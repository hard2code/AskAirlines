App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:8545',
  owner:null,
  seat:null,
  currentAccount:null,
  init: function() {
    $.getJSON('../airlines.json', function(data) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');
      var seatNumSelect = $('#enter_seat_num');

      for (i = 0; i < data.length; i++) {
        proposalTemplate.find('.panel-title').text(data[i].name);
        proposalTemplate.find('img').attr('src', data[i].picture);
        proposalTemplate.find('.btn-change').attr('data-id', data[i].id);
        proposalTemplate.find('#enter_seat_num').attr('data-id', data[i].id);
        for(j=0; j< data[i].seats.length;++j){
          var optionElement = '<option value="'+data[i].seats[j]+'">'+data[i].seats[j]+'</option>';
          seatNumSelect.append(optionElement);
            //proposalTemplate.find('#enter_seat_num option[value="'+j+'"]').text(data[i].seats[j]);
        }
        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }

    });
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    App.populateAddress();
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('Airlines.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var voteArtifact = data;
    App.contracts.vote = TruffleContract(voteArtifact);

    // Set the provider for our contract
    App.contracts.vote.setProvider(App.web3Provider);

    App.getOwner();
    return App.bindEvents();
  });
  },

  bindEvents: function() {

    $(document).on('click', '#balance-details', function(){ var ad = $('#enter_address').val();
     App.handleBalance(ad); });
    $(document).on('click', '#register', function(){ var ad = $('#enter_address').val();
     App.handleRegister(ad); });
     $(document).on('click', '#unregister', function(){ var ad = $('#enter_address').val();
      App.handleUnRegister(ad); });

      /*$(document).on('change', '#enter_address', function(){
        ad = $('#enter_address').val();
        if(ad == web3.eth.coinbase && ad == App.owner){
          jQuery('#unregister').css('display','block');

        }else{
          jQuery('#unregister').css('display','none');
        }
      });*/

    $(document).on('change', '#enter_seat_num', App.changeSeat);

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      if(web3.eth.coinbase == account)
        App.owner = account;
    });




  },

  populateAddress: function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        //if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option>';
          jQuery('#enter_address').append(optionElement);
        //}
      });
    });
  },

  getOwner: function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance;
    }).then(function(result) {
      App.owner = result.constructor.currentProvider.selectedAddress.toString();
      App.currentAccount = web3.eth.coinbase;
      jQuery('#unregister').css('display','block');
    });
  },
  handleRegister: function(addr){

      var airlineInstance;
      App.contracts.vote.deployed().then(function(instance) {
        airlineInstance = instance;
        App.currentAccount = addr;
        return airlineInstance.register({
              gas: 500000,
              from:web3.eth.accounts[0],
              to: App.currentAccount,
              value: web3.toWei(1, 'ether')
           });
      }).then(function(result, err){
          if(result){
              console.log(result.receipt.status);
              console.log(result);
              if(parseInt(result.receipt.status) == 1){
                alert(addr + " registration done successfully")
                App.handleEvents();
              }
              else
              alert(addr + " registration not done successfully due to revert")
          } else {
              alert(addr + " registration failed")
          }
      });
  },
  handleUnRegister: function(addr){
      var airlineInstance;
      App.contracts.vote.deployed().then(function(instance) {
        airlineInstance = instance;
        App.currentAccount = addr;
        return airlineInstance.unregister( addr, {
              gas: 5000000,
              from: web3.eth.accounts[0],
              to:addr,
              value: web3.toWei(1, 'ether')
           });
      }).then(function(result, err){
          if(result){
              console.log(result.receipt.status);
              console.log(result);
              if(parseInt(result.receipt.status) == 1)
              alert(addr + " unregistration done successfully")
              else
              alert(addr + " unregistration not done successfully due to revert")
          } else {
              alert(addr + " unregistration failed")
          }
      });
  },
  handleBalance : function(addr) {
    console.log("coinbase:" + web3.eth.coinbase +
                "\n owner:" + App.owner +
                "\n current account:" + App.currentAccount);
    var AirlineInstance;
    App.contracts.vote.deployed().then(function(instance){
      AirlineInstance = instance;
      App.currentAccount = addr;
      return AirlineInstance.BalanceDetails(App.currentAccount);
    }).then(function(res){
    console.log(res);
      alert(" Your balance is: " + web3.fromWei(res[0], 'ether') + " Ether");
    }).catch(function(err){
      console.log(err.message);
    })
  },

  changeSeat: function(event){
    event.preventDefault();
    var seatNum = parseInt($(event.target).val());
    App.seat = seatNum;
    $(document).on('click', '.btn-change', App.handleChange);

  },
  handleChange: function(event){
    event.preventDefault();
    var airlineNum = parseInt($(event.target).data('id'));
    console.log("Seat number is " + App.seat + " on airline " + airlineNum );
    var AirlineInstance;


    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      var toAirline = accounts[airlineNum];
      App.contracts.vote.deployed().then(function(instance){
        AirlineInstance = instance;
          return AirlineInstance.request(toAirline,App.seat, {from: web3.eth.coinbase});
        }).then(function(result,err){
        if(result){
              //console.log(result.receipt.status);
              if(parseInt(result.receipt.status) == 1){
                App.handleEvents();
                alert(toAirline + " change done successfully")
              }
              else
              alert(toAirline + " change not done successfully due to revert")
          } else {
              alert(toAirline + " change failed")
          }
      });


    });

  },
  handleEvents : function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance;
    }).then(function(result){
      //requestChange
      result.requestChange().watch((err, response) => {
        if (!err) {
          console.log("Request change from: " + response.args.airline +
          "to airline:" + response.args.changeTo +
              " and seat: " + response.args.seatNumber + "." );
        }else {
            console.log("somethig is wrong");
        }
      });

      //paid
      result.paid().watch((err, response) => {
        if (!err) {
          console.log("Coin transfer: " + web3.fromWei(response.args.amount,'ether') +
              " coins were sent from " + response.args.buyer + "." +
              "To account:" + App.owner);
        }else {
            console.log("somethig is wrong");
        }
      });

    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
