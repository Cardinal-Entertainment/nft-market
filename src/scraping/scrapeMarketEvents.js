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

// const mainBSC = "0x8a0c542ba7bbbab7cf3551ffcc546cdc5362d2a1";
const marketInterface = new ethers.utils.Interface(marketContractJSON.abi);
const blocksPerRequest = 5000;

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

// async function watchEvents(eventsCol) {
//   const interface = new ethers.utils.Interface(contractJSON.abi);
//   const filter = {
//     address: testBSC,
//     topics: [ethers.utils.id("Bid(uint256,uint256,address,uint256[])")],
//   };
//   contract.provider.on(filter, async (log) => {
//     const { args } = interface.parseLog(log);
//     try {
//       console.log("Got event!")
//       await eventsCol.insertOne({
//         itemNumber: args[0].toNumber(),
//         bidAmount: ethers.utils.formatEther(args[1].toString()),
//         bidder: args[2],
//         timestamp: Date.now() / 1000,
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   });
// }

async function getLogs(firstBlock, eventsCol) {
  try {
    const filterBid = marketContract.filters.Bid();
    const allEvents = [];
    const latestBlock = await marketContract.provider.getBlockNumber();

    let blockToScrape = firstBlock;
    while (blockToScrape <= latestBlock) {
      const events = await marketContract.queryFilter(
        filterBid,
        blockToScrape,
        blockToScrape + blocksPerRequest
      );

      const decodedEvents = (
        await Promise.all(
          events.map(async (event) => ({
            ...event.decode(event.data, event.topics),
            block: await event.getBlock(),
          }))
        )
      ).map((event) => ({
        itemNumber: event.itemNumber.toNumber(),
        bidAmount: ethers.utils.formatEther(event.bidAmount),
        timestamp: event.block.timestamp,
        bidder: event.bidder,
      }));

      allEvents.push(...decodedEvents);
      blockToScrape += blocksPerRequest;
    }

    console.log({ allEvents });
    await eventsCol.insertMany(allEvents);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

(async () => {
  try {
    const client = MongoClient.client;
    await client.connect();
    // const eventsCol = client.getCollection("bidEvents")

    // watchEvents(eventsCol);
    // getLogs(915142, eventsCol);
    watchMarketEvents(client);
  } catch (err) {
    console.error(err);
  }
})();
