import { v4 as uuidv4 } from 'uuid'
import { CHAIN_ID_TO_NETWORK, EVENT_TYPES, QUERY_KEYS } from '../constants'
import PubSub from 'pubsub-js'
import { getTokenSymbol } from './auction'

export const OBSERVER_EVENT_TYPES = {
  otherBidPlaced: 'otherBidPlaced',
  otherItemListed: 'otherItemListed',
  otherAuctionWon: 'otherAuctionWon',
}

export const FEED_TYPE = {
  observer: 'General',
  self: 'MyAlerts',
}

export const SELF_EVENT_TYPES = {
  selfItemListed: 'selfItemListed',
  selfBidPlaced: 'selfBidPlaced',
  selfAuctionWon: 'selfAuctionWon',
  outBid: 'outBid',
}

export const newBidEventForListing = (
  queryClient,
  auctionId,
  marketContract,
  chainId
) => {
  const token = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
    const randomId = uuidv4()
    const bidWithId = {
      ...data,
      _id: randomId,
    }

    const currentListing = queryClient.getQueryData([
      QUERY_KEYS.listing,
      {
        itemNumber: auctionId,
        marketContractAddress: marketContract?.address,
        chainId,
      },
    ])

    if (data.itemNumber === auctionId) {
      if (
        currentListing &&
        currentListing.bids &&
        currentListing.bids.length > 0
      ) {
        queryClient.setQueryData(
          [
            QUERY_KEYS.listing,
            {
              itemNumber: auctionId,
              marketContractAddress: marketContract?.address,
              chainId,
            },
          ],
          {
            ...currentListing,
            bids: [...currentListing.bids, bidWithId],
            highestBid: data.bidAmount,
          }
        )
      } else {
        queryClient.setQueryData(
          [
            QUERY_KEYS.listing,
            {
              itemNumber: auctionId,
              marketContractAddress: marketContract?.address,
              chainId,
            },
          ],
          {
            ...currentListing,
            bids: [bidWithId],
            highestBid: data.bidAmount,
          }
        )
      }
    }
  })

  return token
}

export const newBidEventForListings = (queryClient, chainId, filters) => {
  const token = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
    const currentData = queryClient.getQueryData([
      QUERY_KEYS.listings,
      { filters, chainId },
    ])

    if (currentData) {
      const auctionId = data.itemNumber
      const currentBidData = queryClient.getQueryData([
        QUERY_KEYS.bids,
        { auctionId, chainId },
      ])

      const randomId = uuidv4()
      const bidWithId = {
        ...data,
        _id: randomId,
      }

      if (data.itemNumber === auctionId) {
        if (currentBidData) {
          queryClient.setQueryData(
            [QUERY_KEYS.bids, { auctionId, chainId }],
            [bidWithId, ...currentBidData]
          )
        } else {
          queryClient.setQueryData(
            [QUERY_KEYS.bids, { auctionId, chainId }],
            [bidWithId]
          )
        }
      }

      queryClient.setQueryData(
        [QUERY_KEYS.listings, { filters, chainId }],
        (queryData) => {
          queryData.pages.map((page) => {
            page.data.map((auction) => {
              if (auction.itemNumber === data.itemNumber) {
                auction.highestBid = data.bidAmount
              }
              return auction
            })
            return page
          })

          return queryData
        }
      )
    }
  })

  return token
}

export const newItemListedEvent = (
  queryClient,
  filters,
  chainId,
  userAddress
) => {
  const token = PubSub.subscribe(EVENT_TYPES.ItemListed, (msg, data) => {
    /**
     * We will only append the new listing based on the current cached data a user is viewing.
     * Say a user clears the filter afterwards,
     * react-query will automatically refetch since we are using filters as part of query key.
     *
     * The assumption is that by the time user switches filter, the new listing should've been
     * stored in the database and API call will fetch it.
     * So it should be safe to have the data eventually consistent.
     */

    const currentData = queryClient.getQueryData([
      QUERY_KEYS.listings,
      { filters, chainId },
    ])

    if (currentData) {
      queryClient.setQueryData(
        [QUERY_KEYS.listings, { filters, chainId }],
        (queryData) => {
          return {
            pageParams: queryData.pageParams,
            pages: [
              {
                totalCount: queryData.pages[0].totalCount + 1,
                nextOffset: queryData.pages[0].nextOffset,
                data: [data],
              },
              ...queryData.pages,
            ],
          }
        }
      )
    } else {
      queryClient.setQueryData([QUERY_KEYS.listings, { filters, chainId }], {
        pageParams: undefined,
        pages: [
          {
            data: [data],
            nextOffset: null,
          },
        ],
      })
    }

    const filterKey =
      data.lister === userAddress ? FEED_TYPE.self : FEED_TYPE.observer
    const liveItemWithType = {
      ...data,
      type:
        data.lister === userAddress
          ? SELF_EVENT_TYPES.selfItemListed
          : OBSERVER_EVENT_TYPES.otherItemListed,
    }

    addLiveFeedItem(queryClient, liveItemWithType, filterKey, chainId)
  })

  return token
}

export const newSettledEvent = (queryClient, userAddress, chainId) => {
  const token = PubSub.subscribe(EVENT_TYPES.Settled, (msg, data) => {
    const settleType = getSettledEventType(data, userAddress)

    const filterKey =
      data.winner === userAddress ? FEED_TYPE.self : FEED_TYPE.observer

    const settleData = {
      ...data,
      type: settleType,
    }
    addLiveFeedItem(queryClient, settleData, filterKey, chainId)
  })

  return token
}

const addLiveFeedItem = (queryClient, liveFeedItem, filterKey, chainId) => {
  const networkName = CHAIN_ID_TO_NETWORK[chainId]
  const uuid = uuidv4()
  const currency = getTokenSymbol(liveFeedItem.saleToken, networkName)

  const newItem = {
    _id: uuid,
    type: liveFeedItem.type,
    timestamp: Date.now() / 1000,
    content: {
      ...liveFeedItem,
      currency: currency,
    },
  }

  queryClient.setQueryData([QUERY_KEYS.liveFeeds, { filterKey }], (data) => {
    if (data) {
      return [newItem, ...data]
    } else {
      return [newItem]
    }
  })

  const newCount = queryClient.getQueryData([
    QUERY_KEYS.liveFeeds,
    { filterKey: 'new' + filterKey },
  ])

  queryClient.setQueryData(
    [QUERY_KEYS.liveFeeds, { filterKey: 'new' + filterKey }],
    typeof newCount === 'string' ? parseInt(newCount) + 1 : newCount + 1
  )
}

const getBidEventType = (bidData, queryClient, userAddress, chainId) => {
  const userData = queryClient.getQueryData([
    QUERY_KEYS.profile,
    {
      userAddress,
      chainId,
    },
  ])
  const itemNumber = bidData.itemNumber

  if (bidData.bidder !== userAddress) {
    if (userData.bids.some((bid) => bid.itemNumber === itemNumber)) {
      return [SELF_EVENT_TYPES.outBid, OBSERVER_EVENT_TYPES.otherBidPlaced]
    }

    return [OBSERVER_EVENT_TYPES.otherBidPlaced]
  }

  return [SELF_EVENT_TYPES.selfBidPlaced]
}

const getSettledEventType = (settledData, userAddress) => {
  if (settledData.winner === userAddress) {
    return SELF_EVENT_TYPES.selfAuctionWon
  } else {
    return OBSERVER_EVENT_TYPES.otherAuctionWon
  }
}

/**
 * Bid data:
 * {
 *  type: outBid | otherBidPlaced | selfBidPlaced
 *  saleToken: string
 *  itemNumber: number
    bidAmount: number
    bidder: string,
    timestamp: number,
    networkName: string
 * }
 */
export const addBidEventToFeed = (
  queryClient,
  userAddress,
  chainId,
  marketContract
) => {
  const token = PubSub.subscribe(EVENT_TYPES.Bid, async (msg, data) => {
    const bidTypes = getBidEventType(data, queryClient, userAddress, chainId)

    const userData = queryClient.getQueryData([
      QUERY_KEYS.profile,
      {
        userAddress,
        chainId,
      },
    ])

    let listingItem = userData.listings.find(
      (listing) => listing.itemNumber === data.itemNumber
    )

    if (!listingItem) {
      listingItem = await marketContract.getListItem(data.itemNumber)
    }

    bidTypes.forEach((bidType) => {
      const bid = {
        ...data,
        type: bidType,
        saleToken: listingItem.saleToken,
      }

      const filterKey =
        bidType === SELF_EVENT_TYPES.selfBidPlaced ||
        bidType === SELF_EVENT_TYPES.outBid
          ? FEED_TYPE.self
          : FEED_TYPE.observer

      addLiveFeedItem(queryClient, bid, filterKey, chainId)
    })
  })

  return token
}
