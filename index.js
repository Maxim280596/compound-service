const express = require('express');
require('dotenv').config();
const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const autostake_abi = require('./autostake_abi.json');
const app = express();
const port = process.env.PORT || 3001;

const StrategyContractAddress = "0x87fc1837846FBC30D20601E425C9703bFC58C1E2";
const SmartContractABI = autostake_abi;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVAT_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const INTERVAL_DURATION = 6000;
const autoCompaundTxnStatus = {};

const autoCompaund = async () => {

  console.log("in function");
  const provider = new Provider(PRIVAT_KEY, RPC_URL);
  const web3 = new Web3(provider);
  const myContract = new web3.eth.Contract(SmartContractABI, StrategyContractAddress);

  
  const receipt = await myContract.methods.harvest().send({from : WALLET_ADDRESS})
  .on('transactionHash', function(hash) {
    console.log(hash)
  })
  .on('receipt', function(receipt) {
    autoCompaundTxnStatus.status = receipt?.status;
    autoCompaundTxnStatus.error = false;
    console.log(receipt)
  })
  .on('error', function(error, receipt) {
    autoCompaundTxnStatus.receipt = receipt?.status;
    autoCompaundTxnStatus.error = true;
    console.log(error)
  })

  
  console.log("done with all things");

}

const epochInterval = setInterval(autoCompaund, INTERVAL_DURATION);

if(autoCompaundTxnStatus?.error && !autoCompaundTxnStatus?.status) {
  autoCompaund();
  if(autoCompaundTxnStatus?.error && !autoCompaundTxnStatus?.status) {
    clearInterval(epochInterval);
    throw(new Error("work stoped"))
  }
}



app.listen(port);
console.log('listening on', port);