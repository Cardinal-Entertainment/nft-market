import { useInfiniteQuery, useQuery } from 'react-query'
import axios from 'axios'
import { apiEndpoint, CHAIN_ID_TO_NETWORK, QUERY_KEYS } from '../constants'
import { getTokenSymbol, isItemSettled } from '../utils/auction'

export const LISTING_PARAMS = {
  status: {
    ended: 'ENDED',
  },
}

const getAuctionListings = async (filters, nextOffset, chainId) => {
  if (!chainId) return null

  const params = new URLSearchParams({
    cardOrigin: filters.cardType || '',
    saleToken: filters.token || '',
    cardRarity: filters.rarity || '',
    search: filters.keyword || '',
    sortBy: filters.sortField || '',
    limit: '5',
    offset: nextOffset,
    status: filters.status || '',
    chainId: chainId,
  })

  const listings = await axios.get(
    `${apiEndpoint}/listings?${params.toString()}`
  )

  const networkName = CHAIN_ID_TO_NETWORK[chainId]

  const ar2 = listings.data.listings
  return {
    data: ar2.map((listing) => ({
      ...listing,
      id: listing._id,
      currency: getTokenSymbol(listing.saleToken, networkName),
    })),
    totalCount: parseInt(listings.data.count),
    nextOffset: parseInt(listings.data.nextOffset),
  }
}

const getSingleAuction = async (itemNumber, marketContract, chainId) => {
  if (!marketContract) {
    return null
  }
  const [listingResponse, bidsResponse, settled] = await Promise.all([
    await axios.get(`${apiEndpoint}/item/${itemNumber}?chainId=${chainId}`),
    await axios.get(`${apiEndpoint}/bids/${itemNumber}?chainId=${chainId}`),
    await isItemSettled(itemNumber, marketContract),
  ])

  if (listingResponse.status === 200 && bidsResponse.status === 200) {
    const { saleToken, lister } = listingResponse.data

    const networkName = CHAIN_ID_TO_NETWORK[chainId]
    const currency = getTokenSymbol(saleToken, networkName)

    return {
      id: itemNumber,
      seller: lister,
      currency,
      bids: bidsResponse.data,
      ...listingResponse.data,
      isItemSettled: settled,
    }
  }

  throw new Error(`Failed to get auction: ${itemNumber}`)
}

export const useFetchListingQuery = (filters, chainId) => {
  return useInfiniteQuery(
    [QUERY_KEYS.listings, { filters, chainId }],
    ({ pageParam }) => getAuctionListings(filters, pageParam, chainId),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.nextOffset > 0) return lastPage.nextOffset
        return undefined
      },
      refetchOnWindowFocus: false,
    }
  )
}

export const useFetchSingleListingQuery = (
  itemNumber,
  marketContract,
  chainId
) => {
  return useQuery(
    [
      QUERY_KEYS.listing,
      { itemNumber, marketContractAddress: marketContract?.address, chainId },
    ],
    () => getSingleAuction(itemNumber, marketContract, chainId),
    {
      refetchOnWindowFocus: false,
    }
  )
}
