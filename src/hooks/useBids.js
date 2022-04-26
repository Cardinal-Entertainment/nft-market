import { useQuery } from 'react-query'
import axios from 'axios'

import { apiEndpoint, QUERY_KEYS } from '../constants'

const getBids = async (auctionId, chainId) => {
  const res = await axios.get(
    `${apiEndpoint}/bids/${auctionId}?chainId=${chainId}`
  )

  if (res.status === 200) {
    return res.data
  }

  throw new Error(`Failed to fetch bids for ${auctionId}`)
}

export const useFetchBids = (auctionId, chainId) =>
  useQuery({
    queryFn: () => getBids(auctionId, chainId),
    queryKey: [QUERY_KEYS.bids, { auctionId, chainId }],
    refetchOnWindowFocus: false,
  })
