import { useQuery } from 'react-query';
import axios from 'axios';

import {apiEndpoint, QUERY_KEYS} from '../constants'

const getBids = async (auctionId) => {
    const res = await axios.get(`${apiEndpoint}/bids/${auctionId}`);

    if (res.status === 200) {
        return res.data;
    }

    throw new Error(`Failed to fetch bids for ${auctionId}`);
}

export const useFetchBids = (auctionId) => useQuery({
    queryFn: () => getBids(auctionId),
    queryKey: [QUERY_KEYS.bids, { auctionId }],
    refetchOnWindowFocus: false
});
