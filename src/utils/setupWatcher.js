import PubSub from 'pubsub-js'
import { ethers } from 'ethers'
import moment from 'moment'
import { EVENT_TYPES } from '../constants'
import { getCardData } from './cardsUtil'
import marketContractJSON from '../contracts/ZoombiesMarketPlace.json'
import { formatBigNumberAmount } from './currencies'

const marketInterface = new ethers.utils.Interface(marketContractJSON.abi)

async function watchEvents(
  marketContractAddress,
  provider,
  filterString,
  eventCallback
) {
  try {
    const eventFilter = {
      address: marketContractAddress,
      topics: [ethers.utils.id(filterString)],
    }

    provider.on(eventFilter, (log) => {
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
      'Settled(uint256,address,address,uint256,address,address,address,uint256,uint256[])',
    callbackFunc: settledCallback,
  },
]

async function bidEventCallback(eventLogs, collectionName, networkName) {
  const { args } = marketInterface.parseLog(eventLogs)
  const bidEvent = {
    itemNumber: args[0].toNumber(),
    bidAmount: args[1].toString(),
    bidder: args[2],
    timestamp: moment().unix(),
    networkName,
  }

  console.log('bid-scraper-event')
  PubSub.publish(EVENT_TYPES.Bid, bidEvent)
}

async function itemListedCallback(
  eventLogs,
  collectionName,
  networkName,
  nftContracts
) {
  const { args } = marketInterface.parseLog(eventLogs)
  const itemNumber = args.itemNumber.toNumber()
  const tokenIds = args.tokenIds.map((tokenId) => {
    return tokenId.toNumber()
  })

  const readOnlyContract = nftContracts[args.nftToken]?.readOnly

  if (!readOnlyContract) return

  const minPrice = formatBigNumberAmount(
    args.minPrice,
    args.saleToken,
    networkName
  )
  const cards = await Promise.all(
    tokenIds.map((tokenId) =>
      getCardData(tokenId, readOnlyContract, networkName)
    )
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
    zoomBurned: args.zoomBurned,
    networkName,
  }

  console.log('item-listed-scraper-event')
  PubSub.publish(EVENT_TYPES.ItemListed, itemListedEvent)
}

async function settledCallback(
  eventLogs,
  collectionName,
  networkName,
  nftContract
) {
  const { args } = marketInterface.parseLog(eventLogs)
  const itemNumber = args.itemNumber.toNumber()

  const bidAmount = formatBigNumberAmount(
    args.bidAmount,
    args.saleToken,
    networkName
  )
  const royaltyAmount = formatBigNumberAmount(
    args.royaltyAmount,
    args.saleToken,
    networkName
  )

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
    networkName,
  }

  console.log('settled-event-scraper-event')
  PubSub.publish(EVENT_TYPES.Settled, settledEvent)
}

async function watchMarketEvents(
  provider,
  marketContractAddress,
  nftContracts,
  networkName = 'moonbase-alpha'
) {
  for (const event of eventsToScrape) {
    console.log(`Start watching ${event.filterString}`)
    watchEvents(marketContractAddress, provider, event.filterString, (log) => {
      event.callbackFunc(
        log,
        event.uniqueIdentifiers,
        networkName,
        nftContracts
      )
    })
  }
}

export default watchMarketEvents
