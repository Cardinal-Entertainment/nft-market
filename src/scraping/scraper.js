#!/usr/bin/env node
const { getLogsFromBlock } = require("./logUtil");
const { EVENT_TYPES, marketContract } = require("./contracts");
const MongoClient = require("./database");
const moment = require('moment');
const { ethers } = require("ethers");

async function decodeBidEvent(events) {
  const eventsWithBlockPromise = events.map(async (event) => ({
    ...event.decode(event.data, event.topics),
    block: await event.getBlock(),
  }));

  const eventsWithBlock = await Promise.all(eventsWithBlockPromise);
  return eventsWithBlock.map((event) => ({
    itemNumber: event.itemNumber.toNumber(),
    bidAmount: ethers.utils.formatEther(event.bidAmount),
    timestamp: event.block.timestamp,
    bidder: event.bidder,
  }));
}

async function decodeItemListedEvent(events) {
    const eventsWithBlockPromise = events.map(async (event) => ({
      ...event.decode(event.data, event.topics),
      block: await event.getBlock(),
    }));
  
    const eventsWithBlock = await Promise.all(eventsWithBlockPromise);
  
    return eventsWithBlock.map(itemListedEvent => ({
        itemNumber: itemListedEvent.itemNumber.toNumber(),
        auctionEnd: itemListedEvent.auctionEnd.toNumber(),
        tokenIds: itemListedEvent.tokenIds.map(tokenId => tokenId.toNumber()),
        minPrice: ethers.utils.formatEther(itemListedEvent.minPrice),
        lister: itemListedEvent.seller,
        saleToken: itemListedEvent.saleToken,
        nftToken: itemListedEvent.nftToken,
        auctionStart: moment().unix(),
    }))
  }

const marketEventsToScrape = [
  {
    collectionName: "bidEvents",
    eventType: EVENT_TYPES.Bid,
    filter: marketContract.filters.Bid(),
    decodeMethod: decodeBidEvent,
  },
  {
      collectionName: "itemListed",
      eventType: EVENT_TYPES.ItemListed,
      filter: marketContract.filters.ItemListed(),
      decodeMethod: decodeItemListedEvent
  }
];

const initialBlock = 1013082;

async function scrapeMarketEvents() {
  for (const marketEvent of marketEventsToScrape) {
    const allEventLogs = await getLogsFromBlock(
      initialBlock,
      marketEvent.eventType,
      marketEvent.filter,
      marketEvent.decodeMethod
    );

    const eventCol = MongoClient.client.getCollection(
      marketEvent.collectionName
    );

    if (allEventLogs.length > 1) {
        eventCol.insertMany(allEventLogs)
    }

    console.log(
      `Scraped ${allEventLogs.length} Events for type: ${marketEvent.eventType}`
    );
  }
}

module.exports = {
  scrapeMarketEvents,
};
