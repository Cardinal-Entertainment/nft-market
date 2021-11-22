import PubSub from 'pubsub-js'
import {
  marketContract,
  marketContractAddress,
  marketContractJSON,
} from "./contract"
import { ethers } from "ethers"
import moment from "moment"
const marketInterface = new ethers.utils.Interface(marketContractJSON.abi)

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

    contract.provider.on(eventFilter, (log) => {
      eventCallback(log);
    });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

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
    timestamp: moment().unix(),
  }

  PubSub.publish('BID_EVENT', bidEvent)
}

async function itemListedCallback(
  eventLogs,
  collectionName,
  dbClient,
  uniqueIdentifiers
) {
  PubSub.publish('LISTING_EVENT')
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

export default watchMarketEvents
