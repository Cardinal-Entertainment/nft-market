const { marketContract } = require("./contracts");



const blocksPerRequest = 10000;

async function getLogsFromBlock(fromBlock, eventName, eventFilter, decodeMethod) {
  try {
    const allEvents = [];
    const latestBlock = await marketContract.provider.getBlockNumber();

    let blockToScrape = fromBlock;

    while (blockToScrape <= latestBlock) {
      const events = await marketContract.queryFilter(
        eventFilter,
        blockToScrape,
        blockToScrape + blocksPerRequest
      );

      if (events.length > 0) {
        const decodedEvents = await decodeMethod(events);
        
        allEvents.push(...decodedEvents);
      }

      blockToScrape += blocksPerRequest;
    }

    return allEvents;
  } catch (err) {
    console.error("Scrape Log Error: ", err);
  }
}

module.exports = {
  getLogsFromBlock
};
