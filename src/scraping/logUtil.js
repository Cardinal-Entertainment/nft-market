const MongoClient = require("./database");
const { marketContract } = require("./contracts");

const { ethers } = require("ethers");

const blocksPerRequest = 10000;

const marketContractFilters = {
  Bid: marketContract.filters.Bid(),
  ItemListed: marketContract.filters.ItemListed(),
};

const decodeEventMap = {
  Bid: decodeBidEvent,
};

const EVENT_TYPES = {
    Bid: 'Bid',
    ItemListed: 'ItemListed'
}

async function decodeBidEvent(events) {
    const eventsWithBlockPromise = events.map(async (event) => ({
        ...event.decode(event.data, event.topics),
        block: await event.getBlock(), 
    }))

    const eventsWithBlock = await Promise.all(eventsWithBlockPromise);
    return eventsWithBlock.map((event) => ({
        itemNumber: event.itemNumber.toNumber(),
        bidAmount: ethers.utils.formatEther(event.bidAmount),
        timestamp: event.block.timestamp,
        bidder: event.bidder,
      }))
}

async function getLogsFromBlock(fromBlock, collectionName, eventName) {
  try {
    const collection = MongoClient.client.getCollection(collectionName);

    const eventFilter = marketContractFilters[eventName];
    const allEvents = [];
    const latestBlock = await marketContract.provider.getBlockNumber();

    let blockToScrape = fromBlock;

    while (blockToScrape <= latestBlock) {
      const events = await marketContract.queryFilter(
        eventFilter,
        blockToScrape,
        blockToScrape + blocksPerRequest
      );

    //   console.log(events);

      if (events.length > 0) {
        const decodeMethod = decodeEventMap[eventName];
        const decodedEvents = await decodeMethod(events);

        allEvents.push(...decodedEvents);
      }

      blockToScrape += blocksPerRequest;
    }

    console.log(`Finished scraping ${allEvents.length} Events.`)
    collection.insertMany(allEvents);
  } catch (err) {
    console.error("Scrape Log Error: ", err);
  }
}

module.exports = {
    getLogsFromBlock,
    EVENT_TYPES
}