#!/usr/bin/env node

const MongoClient = require("./database");
const {
    watchMarketEvents
} = require('./watcher')

const {
    scrapeMarketEvents
} = require('./scraper');

(async () => {
    try {
        const client = MongoClient.client;
        await client.connect();

        watchMarketEvents(client);
        // scrapeMarketEvents()
    } catch (err) {
        console.error(err);
      }
})();