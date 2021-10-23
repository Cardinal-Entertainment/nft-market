#!/usr/bin/env node

const { ethers } = require("ethers");
const rpcProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.moonbeam.network"
);

const marketContractJSON = require("../contracts/ZoombiesMarketPlace.json");
const marketContractAddress = "0x22d4647013345cB0311c1D566558Df9f01c14b1b";

const zoomContractAddress = '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316';

const zoombiesContractJSON = require('../contracts/Zoombies.json');
const zoombiesContractAddress = "0x3E7997B8D30AA6216102fb2e9206246e478d57d3";

const marketContract = new ethers.Contract(
  marketContractAddress,
  marketContractJSON.abi,
  rpcProvider
);

const zoombiesContract = new ethers.Contract(
  zoombiesContractAddress,
  zoombiesContractJSON.abi,
  rpcProvider
)

const EVENT_TYPES = {
  Bid: "Bid",
  ItemListed: "ItemListed",
};

module.exports = {
  marketContract,
  marketContractJSON,
  marketContractAddress,
  zoomContractAddress,
  zoombiesContract,
  zoombiesContractAddress,
  EVENT_TYPES
};
