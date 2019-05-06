# AskAirlines


https://github.com/hard2code/AskAirlines

<small> The smart contract used is based on the example of ballot2 app from class </small>

## Structure

AskAirlines:
   -ask-app
      node_moduals
      src
        css
		    js
          - app.js
        images
        fonts
        - airline.js
        - index.html
		 - bs-config.json
	   index.js

   -ask-blockchain
        build
        contracts
          - Airlines.sol
          - Migrations.sol
        migrations
          - 1_initial_migration.js
          - 2_deploy_airlines.js
        tests
        truffle.js


## Prerequisite
1. Node.js
2. Metamask (LTS)
3. Truffle (v5.0.1)
4. Ganache



## Instruction for DApp

1. go to the ask-blockchain folder.
2. Execute `truffle compile`
3. Execute  `truffle migrate` this will deploy the smart contract on ganache http://127.0.0.1:8545
4. now open the ask-app folder in another terminal
5. To Start the Node.js server execute `npm run div`
6. This should start the front end of the application at localhost:3000
7. Open Metamask in your chrome browser and enter the key phrase you got after executing truffle develop
8. Now connect to private network/custom RPC using http://127.0.0.1:8545
7. Refresh the WebPage after logging into MetaMask and you should see the page populated.
8. Now you should be in the first account in the metamask
9. To test registering an airline go and select an address from the dropdown and make sure the address on metamask is the same you selected, then click on Register Airline button.
10. You should see "registration done successfully" alert window indicating a successful registration and and if you clicked on Show balance you should see a balance of 1 ether is set to that account.
11. Now to test changing to a new airline, select the seat number from the dropdown option and click on change airline button. Make sure you are selecting the right address from both metamask and the address dropdown. This step will work on the back end by checking to see if the request event was triggered, if so it will trigger a response event were it will take the airline address and the seat number to make a transaction to the new airline by calling payToAirline from the smart contract.
13. Finally, to test unregister airline , go to the chairpersion account and select the account you want to unregister from the drop down, and click unregister Airline button. This will ask you to make a transaction with metamask if you accept it will send the balance back to the airline. check this by going to the metamask account and clicking the show balance button.

Note:
1. To deploy a new instance of the contract exit the npm server and then execute truffle migrate --reset and then start the server again.
2. The contract is deployed from account[0] i.e the first account in the metamask.
3. If the transactions are failing due to this error - "Account Nonce mismatched", try resetting the account in account settings, do "truffle migrate --reset" and restart the node server.
