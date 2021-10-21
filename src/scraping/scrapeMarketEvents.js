#!/usr/bin/env node

// const { MongoClient } = require("mongodb");
const MongoClient = require("./database");
const { ethers } = require("ethers");
const {
  marketContract,
  marketContractAddress,
  marketContractJSON,
} = require("./contracts");
const { watchEvents } = require("./scrapeUtil");
const {getLogsFromBlock, EVENT_TYPES} = require('./logUtil')

// const mainBSC = "0x8a0c542ba7bbbab7cf3551ffcc546cdc5362d2a1";
const marketInterface = new ethers.utils.Interface(marketContractJSON.abi);

const eventsToScrape = {
  marketEvents: {
    contractAddress: marketContractAddress,
    contract: marketContract,
    events: [
      {
        collectionName: "bidEvents",
        filterString: "Bid(uint256,uint256,address,uint256[])",
        callbackFunc: bidEventCallback,
      },
      {
        collectionName: "itemListed",
        filterString: "ItemListed(address,uint256[],address,uint256)",
        callbackFunc: itemListedCallback,
      },
    ],
  },
};

async function bidEventCallback(eventLogs, collectionName, dbClient) {
  const { args } = marketInterface.parseLog(eventLogs);
  const bidEventCollection = dbClient.getCollection(collectionName);
  await bidEventCollection.insertOne({
    itemNumber: args[0].toNumber(),
    bidAmount: ethers.utils.formatEther(args[1].toString()),
    bidder: args[2],
    timestamp: Date.now() / 1000,
  });
}

async function itemListedCallback(eventLogs) {
  const { args } = marketInterface.parseLog(eventLogs);
  console.log("got item listed event!");
  console.log(args);
}

async function watchMarketEvents(dbClient) {
  const eventObject = eventsToScrape.marketEvents;

  for (const event of eventObject.events) {
    watchEvents(
      event.filterString,
      eventObject.contractAddress,
      eventObject.contract,
      (log) => {
        event.callbackFunc(log, event.collectionName, dbClient);
      }
    );
  }
}

(async () => {
  try {
    const client = MongoClient.client;
    await client.connect();

    // watchEvents(eventsCol);
    // getLogs(915142, eventsCol);
    watchMarketEvents(client);
    getLogsFromBlock(915142, 'testCollection', EVENT_TYPES.Bid)
  } catch (err) {
    console.error(err);
  }
})();
