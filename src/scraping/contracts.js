#!/usr/bin/env node

const { ethers } = require("ethers");
const rpcProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.moonbeam.network"
);

const marketContractJSON = require("../contracts/ZoombiesMarketPlace.json");
const marketContractAddress = "0x174faA908bee1bCb6f714b39216257DFfA1d921c";

const marketContract = new ethers.Contract(
  marketContractAddress,
  marketContractJSON.abi,
  rpcProvider
);

module.exports = {
  marketContract,
  marketContractJSON,
  marketContractAddress,
};
