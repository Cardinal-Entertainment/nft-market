#!/usr/bin/env node

const { ethers } = require("ethers")
const {
  marketContract,
  marketContractAddress,
  marketContractJSON,
} = require("./utils/contracts")
const { watchEvents } = require("./utils/watcherUtil")
const moment = require("moment")
const { getAndStoreCards } = require("./utils/cardUtil")
const { persistEvent } = require('./scraper')

const marketInterface = new ethers.utils.Interface(marketContractJSON.abi)

const eventsToScrape = {
  marketEvents: {
    contractAddress: marketContractAddress,
    contract: marketContract,
    events: [
      {
        collectionName: "Bid",
        filterString: "Bid(uint256,uint256,address,uint256[])",
        callbackFunc: bidEventCallback,
        uniqueIdentifiers: ["itemNumber", "bidAmount"],
      },
      {
        collectionName: "ItemListed",
        filterString:
          "ItemListed(uint256,uint256,address,uint256[],address,address,uint256)",
        callbackFunc: itemListedCallback,
        uniqueIdentifiers: ["itemNumber"],
      },
    ],
  },
}

async function bidEventCallback(
  eventLogs,
  collectionName,
  dbClient,
  uniqueIdentifiers
) {
  const { args } = marketInterface.parseLog(eventLogs)
  const bidEvent = {
    itemNumber: args[0].toNumber(),
    bidAmount: Number(ethers.utils.formatEther(args[1].toString())),
    bidder: args[2],
    timestamp: moment().unix(), //get block timestamp
  }

  // refetch List Item
}

async function itemListedCallback(
  eventLogs,
  collectionName,
  dbClient,
  uniqueIdentifiers
) {
  // refetch all listings
}

async function watchMarketEvents(dbClient) {
  const eventObject = eventsToScrape.marketEvents

  for (const event of eventObject.events) {
    watchEvents(
      event.filterString,
      eventObject.contractAddress,
      eventObject.contract,
      (log) => {
        event.callbackFunc(
          log,
          event.collectionName,
          dbClient,
          event.uniqueIdentifiers
        )
      }
    )
  }
}

module.exports = {
  watchMarketEvents,
}
