import PubSub from 'pubsub-js'
import { ethers } from 'ethers'
import moment from 'moment'
import { marketContractJSON, EVENT_TYPES } from '../constants'
import { getCardData } from './cardsUtil'

const marketInterface = new ethers.utils.Interface(marketContractJSON.abi)

async function watchEvents(
  marketContractAddress,
  marketContract,
  filterString,
  eventCallback
) {
  try {
    const eventFilter = {
      address: marketContractAddress,
      topics: [ethers.utils.id(filterString)],
    }

    marketContract.provider.on(eventFilter, (log) => {
      eventCallback(log)
    })
  } catch (err) {
    console.error(`Failed to watch event: ${filterString}`)
  }
}

const eventsToScrape = [
  {
    filterString: 'Bid(uint256,uint256,address,uint256[])',
    callbackFunc: bidEventCallback,
  },
  {
    filterString:
      'ItemListed(uint256,uint256,address,uint256[],address,address,uint256,uint256)',
    callbackFunc: itemListedCallback,
  },
  {
    filterString:
      'Settled(uint256 indexed,address,address,uint256,address indexed,address indexed,address,uint256,uint256[])',
    callbackFunc: settledCallback,
  },
]

async function bidEventCallback(eventLogs, collectionName) {
  const { args } = marketInterface.parseLog(eventLogs)
  const bidEvent = {
    itemNumber: args[0].toNumber(),
    bidAmount: Number(ethers.utils.formatEther(args[1].toString())),
    bidder: args[2],
    timestamp: moment().unix(),
  }

  console.log('bid-scraper-event')
  PubSub.publish(EVENT_TYPES.Bid, bidEvent)
}

async function itemListedCallback(eventLogs, collectionName, nftContract) {
  const { args } = marketInterface.parseLog(eventLogs)
  const itemNumber = args.itemNumber.toNumber()
  const tokenIds = args.tokenIds.map((tokenId) => {
    return tokenId.toNumber()
  })

  const minPrice = Number(ethers.utils.formatEther(args.minPrice))
  const cards = await Promise.all(
    tokenIds.map((tokenId) => getCardData(tokenId, nftContract))
  )

  const itemListedEvent = {
    itemNumber,
    auctionEnd: args.auctionEnd.toNumber(),
    tokenIds,
    minPrice,
    highestBid: 0,
    lister: args.seller,
    saleToken: args.saleToken,
    nftToken: args.nftToken,
    auctionStart: moment().unix(),
    highestBidder: null,
    cards,
    zoomBurned: args.zoomBurned
  }

  console.log('item-listed-scraper-event')
  PubSub.publish(EVENT_TYPES.ItemListed, itemListedEvent)
}

async function settledCallback(eventLogs, collectionName, nftContract) {
  const { args } = marketInterface.parseLog(eventLogs)
  const itemNumber = args.itemNumber.toNumber()

  const bidAmount = Number(ethers.utils.formatEther(args.bidAmount))
  const royaltyAmount = Number(ethers.utils.formatEther(args.royaltyAmount))

  const tokenIds = args.tokenIds.map((tokenId) => {
    return tokenId.toNumber()
  })

  const settledEvent = {
    itemNumber,
    tokenIds,
    bidAmount,
    royaltyAmount,
    seller: args.seller,
    winner: args.winner,
    saleToken: args.saleToken,
    nftToken: args.nftToken,
    royaltyReceiver: args.royaltyReceiver,
  }

  console.log('settled-event-scraper-event')
  PubSub.publish(EVENT_TYPES.Settled, settledEvent)
}

async function watchMarketEvents(
  marketContract,
  marketContractAddress,
  nftContract
) {
  for (const event of eventsToScrape) {
    console.log(`Start watching ${event.filterString}`)
    watchEvents(
      marketContractAddress,
      marketContract,
      event.filterString,
      (log) => {
        event.callbackFunc(log, event.uniqueIdentifiers, nftContract)
      }
    )
  }
}

export default watchMarketEvents
