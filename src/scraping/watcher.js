#!/usr/bin/env node

const { ethers } = require("ethers");
const {
  marketContract,
  marketContractAddress,
  marketContractJSON,
} = require("./contracts");
const { watchEvents } = require("./watcherUtil");
const moment = require('moment');
const { getAndStoreCards } = require("./cardUtil");

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
        filterString:
          "ItemListed(uint256,uint256,address,uint256[],address,address,uint256)",
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

async function itemListedCallback(eventLogs, collectionName, dbClient) {

  const { args } = marketInterface.parseLog(eventLogs);
  const itemNumber = args.itemNumber.toNumber();
  const tokenIds = args.tokenIds.map((tokenId) => {
    return tokenId.toNumber();
  });

  getAndStoreCards(tokenIds, itemNumber);
  const minPrice = ethers.utils.formatEther(args.minPrice);

  const auctionItem = {
    itemNumber,
    tokenIds,
    minPrice,
    lister: args.lister,
    saleToken: args.saleToken.toLowerCase(),
    nftToken: args.nftToken.toLowerCase(),
    auctionStart: moment().unix(),
    auctionEnd: args.auctionEnd.toNumber()
  }

  // console.log(args)

  const itemListedCollection = dbClient.getCollection(collectionName);
  itemListedCollection.insertOne(auctionItem);
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

module.exports = {
  watchMarketEvents,
};
