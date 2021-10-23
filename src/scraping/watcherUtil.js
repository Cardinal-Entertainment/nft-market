#!/usr/bin/env node

const { ethers } = require("ethers");

/**
 *
 * @param {string} filterString Event filter string.
 * @param {string} contractAddress Contract address string.
 * @param {func} eventCallback callback function that takes the event log as a parameter, called whenever
 *                          received an event.
 * @param {contract} contract Ethers.js contract object.
 */
async function watchEvents(
  filterString,
  contractAddress,
  contract,
  eventCallback
) {
  try {
    const eventFilter = {
      address: contractAddress,
      topics: [ethers.utils.id(filterString)],
    };

    console.log(filterString);

    contract.provider.on(eventFilter, (log) => {
      eventCallback(log);
    });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

module.exports = {
  watchEvents,
};
