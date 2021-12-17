import { useQuery } from 'react-query'
import axios from 'axios'
import { ethers } from 'ethers'
import { apiEndpoint, marketContractAddress, QUERY_KEYS } from '../constants'
import { getCardData } from 'utils/cardsUtil'

const getUserProfiles = async (userAddress) => {
  if (!ethers.utils.isAddress(userAddress)) {
    //console.error('Address is invalid.');
    return null
  }

  const response = await axios.get(`${apiEndpoint}/profile/${userAddress}`)

  if (response.status !== 200) {
    console.error(response.statusText)
    throw new Error('Failed to get profile.')
  }

  return response.data
}

export const useFetchProfileQuery = (userAddress) =>
  useQuery({
    queryKey: [QUERY_KEYS.profile, { userAddress }],
    queryFn: () => getUserProfiles(userAddress),
    ...{
      refetchOnWindowFocus: false,
    },
  })

const getUserNFTs = async (userAddress, zoombiesContract, marketContract) => {
  try {
    if (!zoombiesContract || !userAddress || !marketContract) {
      return null
    }

    const nftsCount = await zoombiesContract.balanceOf(userAddress)

    const tokensOfOwner = []
    for (let i = 0; i < nftsCount; i++) {
      const nftTokenId = await zoombiesContract.tokenOfOwnerByIndex(
        userAddress,
        i
      )

      tokensOfOwner.push(nftTokenId)
    }

    const cards = await Promise.all(
      tokensOfOwner.map((token) =>
        getCardData(parseInt(token), zoombiesContract)
      )
    )

    const zoomBurnFee = await marketContract.zoomBurnFee()

    return {
      userNFTs: cards,
      zoomBurnFee: parseFloat(ethers.utils.formatEther(zoomBurnFee)),
    }
  } catch (e) {
    console.error('Failed to fetch user NFT:', e)
  }
}

export const useFetchUserNFTQuery = (
  userAddress,
  zoombiesContract,
  marketContract
) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.userNFT,
      {
        userAddress,
        zoombiesContract: zoombiesContract?.address,
        marketContract: marketContract?.address,
      },
    ],
    queryFn: () => getUserNFTs(userAddress, zoombiesContract, marketContract),
    ...{
      refetchOnWindowFocus: false,
    },
  })


  const getUserZoomAllowance = async (zoomTokenContract, ownerAddress) => {
    if (zoomTokenContract) {
      const allowance = await zoomTokenContract.allowance(ownerAddress, marketContractAddress);
      return parseInt(allowance.toString())
    } else {
      return 0;
    }
  }

  export const useGetZoomAllowanceQuery = (
    userAddress,
    zoomTokenContract
  ) => useQuery({
    queryKey: [QUERY_KEYS.zoomAllowance, { zoomTokenContract: zoomTokenContract?.address, userAddress }],
    queryFn: () => getUserZoomAllowance(zoomTokenContract, userAddress),
    refetchOnWindowFocus: false
  })