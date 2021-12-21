#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const { ethers } = require('ethers');
const rpcProvider = new ethers.providers.JsonRpcProvider(
  'https://rpc.testnet.moonbeam.network'
);

const contractJSON = require('../contracts/ZoombiesMarketPlace.json');
const testBSC = '0x174faA908bee1bCb6f714b39216257DFfA1d921c';
// const mainBSC = "0x8a0c542ba7bbbab7cf3551ffcc546cdc5362d2a1";

const connectionString = 'mongodb://127.0.0.1:27017/events';
const contract = new ethers.Contract(testBSC, contractJSON.abi, rpcProvider);
const blocksPerRequest = 5000;

async function watchEvents(eventsCol) {
  const etherInterface = new ethers.utils.Interface(contractJSON.abi);
  const filter = {
    address: testBSC,
    topics: [ethers.utils.id('Bid(uint256,uint256,address,uint256[])')],
  };
  contract.provider.on(filter, async (log) => {
    const { args } = etherInterface.parseLog(log);
    try {
      await eventsCol.insertOne({
        itemNumber: args[0].toNumber(),
        bidAmount: ethers.utils.formatEther(args[1].toString()),
        bidder: args[2],
        timestamp: Date.now() / 1000,
      });
    } catch (err) {
      console.error(err);
    }
  });
}

async function getLogs(firstBlock, eventsCol) {
  try {
    const filterBid = contract.filters.Bid();
    const allEvents = [];
    const latestBlock = await contract.provider.getBlockNumber();

    let blockToScrape = firstBlock;
    while (blockToScrape <= latestBlock) {
      const events = await contract.queryFilter(
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

    await eventsCol.insertMany(allEvents);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

(async () => {
  const client = new MongoClient(connectionString);
  await client.connect();
  const db = client.db('events');
  const eventsCol = db.collection('bidEvents');

  watchEvents(eventsCol);
  getLogs(915142, eventsCol);
})();
