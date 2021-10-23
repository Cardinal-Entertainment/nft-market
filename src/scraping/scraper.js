#!/usr/bin/env node
const {getLogsFromBlock, EVENT_TYPES} = require('./logUtil')
const MongoClient = require("./database");

const marketEventsToScrape = [{
    collectionName: "bidEvents",
    eventType: EVENT_TYPES.Bid
}, {
    collectionName: "itemListed",
    eventType: EVENT_TYPES.ItemListed
}];

const initialBlock = 1007454;

async function scrapeMarketEvents() {
    for (const marketEvent of marketEventsToScrape) {
        const allEventLogs = await getLogsFromBlock(initialBlock, marketEvent.eventType)
    
        const eventCol = MongoClient.client.getCollection(marketEvent.collectionName)
        if (allEventLogs.length > 1) {
            eventCol.insertMany(allEventLogs)
        }

        console.log(`Scraped ${allEventLogs.length} Events for type: ${marketEvent.eventType}`)
    }
}

module.exports = {
    scrapeMarketEvents
}