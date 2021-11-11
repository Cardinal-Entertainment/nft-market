import { useQuery } from 'react-query';
import axios from 'axios';
import {apiEndpoint} from "../constants";

const getListings = async ( filters ) => {

  const params = new URLSearchParams({
    cardOrigin: filters.cardType,
    saleToken: filters.token,
    cardRarity: filters.rarity,
    search: filters.keyword,
    sortBy: filters.sortField
  })

  const response = await axios.get(`${apiEndpoint}/listing/${params.toString()}`);

  if (response.status !== 200) {
      console.error(response.statusText);
      throw new Error("Failed to get profile.");
  }

  return response.data;
};

export const useFetchListingQuery = ( filters ) =>
  useQuery({
    queryKey: ['fetchListing', JSON.stringify(filters)],
    queryFn: () => getListings(filters),
    ...{
      refetchOnWindowFocus: false,
    },
  });
