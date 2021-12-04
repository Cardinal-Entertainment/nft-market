import { useInfiniteQuery, useQuery } from 'react-query'
import axios from 'axios'
import { apiEndpoint, QUERY_KEYS } from '../constants'
import { getTokenSymbol } from '../utils/auction'

export const LISTING_PARAMS = {
  status: {
    ended: 'ENDED',
  },
}

const getAuctionListings = async (filters, nextOffset) => {
  const params = new URLSearchParams({
    cardOrigin: filters.cardType || '',
    saleToken: filters.token || '',
    cardRarity: filters.rarity || '',
    search: filters.keyword || '',
    sortBy: filters.sortField || '',
    offset: nextOffset,
    limit: '5',
    status: filters.status || '',
  })

  const listings = await axios.get(
    `${apiEndpoint}/listings?${params.toString()}`
  )
  // const listings = await axios.get(`http://localhost:3001/listings?${params.toString()}`)

  const ar2 = listings.data.listings
  return {
    data: ar2.map((listing) => ({
      ...listing,
      id: listing._id,
      currency: getTokenSymbol(listing.saleToken),
    })),
    totalCount: parseInt(listings.data.count),
    nextOffset: parseInt(listings.data.nextOffset),
  }
}

const getSingleAuction = async (itemNumber, marketContract) => {
  if (!marketContract) {
    return null
  }
  const [listingResponse, bidsResponse, itemFromChain] = await Promise.all([
    await axios.get(`${apiEndpoint}/item/${itemNumber}`),
    await axios.get(`${apiEndpoint}/bids/${itemNumber}`),
    await marketContract.getListItem(itemNumber),
  ])

  if (listingResponse.status === 200 && bidsResponse.status === 200) {
    const { saleToken, lister } = listingResponse.data

    const currency = getTokenSymbol(saleToken)

    const isItemSettled =
      itemFromChain === undefined ||
      itemFromChain.seller === '0x0000000000000000000000000000000000000000'
        ? true
        : false

    return {
      id: itemNumber,
      seller: lister,
      currency,
      bids: bidsResponse.data,
      ...listingResponse.data,
      isItemSettled,
    }
  }

  throw new Error(`Failed to get auction: ${itemNumber}`)
}

export const useFetchListingQuery = (filters) => {
  return useInfiniteQuery(
    [QUERY_KEYS.listings, { filters }],
    ({ pageParam }) => getAuctionListings(filters, pageParam),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.nextOffset > 0) return lastPage.nextOffset
        return undefined
      },
      refetchOnWindowFocus: false,
    }
  )
}

export const useFetchSingleListingQuery = (itemNumber, marketContract) => {
  return useQuery(
    [
      QUERY_KEYS.listing,
      { itemNumber, marketContractAddress: marketContract?.address },
    ],
    () => getSingleAuction(itemNumber, marketContract),
    {
      refetchOnWindowFocus: false,
    }
  )
}
