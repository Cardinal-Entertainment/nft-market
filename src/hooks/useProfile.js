import { useQuery } from 'react-query';
import axios from 'axios';
import { ethers } from 'ethers';

const devApi = 'http://localhost:4000';

const getUserProfiles = async (userAddress) => {
  if (!ethers.utils.isAddress(userAddress)) {
    console.error("Address is invalid.");
    return null;
  }

  const response = await axios.get(`${devApi}/profile/${userAddress}`);

  if (response.status !== 200) {
      console.error(response.statusText);
      throw new Error("Failed to get profile.");
  }

  return response.data;
};

export const useFetchProfileQuery = (userAddress) =>
  useQuery({
    queryKey: ['fetchUserProfile', { userAddress }],
    queryFn: () => getUserProfiles(userAddress),
    ...{
      refetchOnWindowFocus: false,
      retry: false
    },
  });
