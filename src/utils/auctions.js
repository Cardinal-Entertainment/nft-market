import moment from 'moment'

export const getItemListedEventsFromDate = async (date, contract) => {
    const events = {};

    let blockTime;
    let toBlock = null;
    console.time("wholeScraping");
    
    do {
         // Filter by all itemListed events
        const itemListedFilter = contract.filters.ItemListed(null);
        const fromBlock = toBlock ? toBlock - 10000 : -10000
        console.time("scrapeOnce");
        const firstSetOfEvents = await contract.queryFilter(itemListedFilter, fromBlock, toBlock);
        console.timeEnd("scrapeOnce");
        console.log(fromBlock, toBlock)

        // if (firstSetOfEvents.length === 0) {
        //     return events;
        // }

        for (const event of firstSetOfEvents) {
            const eventBlock = await event.getBlock();
            // console.log(eventBlock)
            events[eventBlock.timestamp] = event.decode(event.data, event.topics);
            console.log(moment(eventBlock.timestamp * 1000).toString())
        }

        const oldestEvent = firstSetOfEvents[firstSetOfEvents.length - 1];
        const oldestBlock = await oldestEvent.getBlock();

        blockTime = moment(oldestBlock.timestamp * 1000);
        if (toBlock === oldestBlock.number) {
            break;
        }
        toBlock = oldestBlock.number;
    } while (blockTime.isAfter(date))
    console.timeEnd("wholeScraping");
    return events;
}
