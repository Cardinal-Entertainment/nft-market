import {useInfiniteQuery, useQuery} from 'react-query';
import axios from 'axios';
import {apiEndpoint, marketContractAddress, zoombiesContractAddress} from "../constants";
import {getTokenSymbol} from "../utils/auction";

export const getAuctionListings = async (marketContract, zoombiesContract, filters, sorting, page) => {
  // console.log({filters, sorting})

  const getSortType = () => {
    // switch(sorting.field) {
    //   case 'auctionEnd':
    //     return 'END_TIME'
    //   case 'minPrice':
    //     return 'MIN_PRICE'
    //   case 'highestBid':
    //     return 'HIGHEST_BID'
    //   case '':
    //     return null
    //   default:
    //     throw new Error(`Unhandled sort type: ${sorting.field}`)
    // }
    return sorting.field
  }

  const params = new URLSearchParams({
    cardOrigin: filters.cardType,
    saleToken: filters.token,
    cardRarity: filters.rarity,
    search: filters.keyword,
    sortBy: getSortType() ?? '',
    offset: page * 5,
    limit: '5'
  })

  const listings = await axios.get(`https://api.zoombies.world/listings?${params.toString()}`)
  // const listings = await axios.get(`http://localhost:3001/listings?${params.toString()}`)

  const ar2 = listings.data.listings
  return {
    data: ar2.map((listing) => ({
      ...listing,
      id: listing._id,
      currency: getTokenSymbol(listing.saleToken),
    })),
    nextPage: page + 1, totalCount: parseInt(listings.data.count)
  }
};

export const useFetchListingQuery = ( filters, sortBy, callback ) => {
  return useInfiniteQuery(
    'listings',
    async ({ pageParam = 0 }) => {
      const res = await getAuctionListings(marketContractAddress, zoombiesContractAddress, filters, sortBy, pageParam)
      if (callback) {
        callback(res.totalCount)
      }
      return res

    },{
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.nextPage < (lastPage.totalCount / 5)) return lastPage.nextPage;
        return undefined;
      }
    }
  )
}