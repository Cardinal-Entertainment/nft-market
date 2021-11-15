import {useInfiniteQuery, useQuery} from 'react-query';
import axios from 'axios';
import {apiEndpoint, marketContractAddress, zoombiesContractAddress} from "../constants";
import {getTokenSymbol} from "../utils/auction";

export const getAuctionListings = async (marketContract, zoombiesContract, filters, page) => {

  const params = new URLSearchParams({
    cardOrigin: filters.cardType,
    saleToken: filters.token,
    cardRarity: filters.rarity,
    search: filters.keyword,
    sortBy: filters.sortField,
    offset: page * 5,
    limit: '5'
  })

  const listings = await axios.get(`${apiEndpoint}/listings?${params.toString()}`)
  // const listings = await axios.get(`http://localhost:3001/listings?${params.toString()}`)

  const ar2 = listings.data.listings
  return {
    data: ar2.map((listing) => ({
      ...listing,
      id: listing._id,
      currency: getTokenSymbol(listing.saleToken),
    })),
    nextPage: page + 1,
    totalCount: parseInt(listings.data.count),
    nextOffset: parseInt(listings.data.nextOffset)
  }
};

export const useFetchListingQuery = ( filters, callback ) => {
  return useInfiniteQuery(
    'listings',
    async ({ pageParam = 0 }) => {
      const res = await getAuctionListings(marketContractAddress, zoombiesContractAddress, filters, pageParam)
      if (callback) {
        callback(res.totalCount)
      }
      return res

    },{
      getNextPageParam: (lastPage, pages) => {

        if (lastPage.nextOffset > 0) return lastPage.nextPage
        return undefined;
      }
    }
  )
}