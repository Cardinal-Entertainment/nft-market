import { useQuery } from 'react-query'
import axios from 'axios'
import { ethers } from 'ethers'
import { apiEndpoint, marketContractAddress, QUERY_KEYS } from '../constants'
import { getCardData } from 'utils/cardsUtil'
import { isItemSettled } from 'utils/auction'
import { toBigNumber } from '../utils/BigNumbers'

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

const getUserNFTs = async (userAddress, nftContract, marketContract) => {
  try {
    if (!nftContract || !userAddress || !marketContract) {
      return null
    }

    const nftsCount = await nftContract.balanceOf(userAddress)

    const tokensOfOwner = []
    for (let i = 0; i < nftsCount; i++) {
      const nftTokenId = await nftContract.tokenOfOwnerByIndex(userAddress, i)

      tokensOfOwner.push(nftTokenId)
    }

    // console.log("nftsCount", nftsCount)
    // console.log("tokensOfOwner", tokensOfOwner)

    const cards = await Promise.all(
      tokensOfOwner.map((token) => {
        return getCardData(parseInt(token), nftContract)
      })
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
  nftContract,
  marketContract
) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.userNFT,
      {
        userAddress,
        nftContract: nftContract?.address,
        marketContract: marketContract?.address,
      },
    ],
    queryFn: () => getUserNFTs(userAddress, nftContract, marketContract),
    ...{
      refetchOnWindowFocus: false,
    },
  })

export const getUserTokenAllowance = async (tokenContract, ownerAddress) => {
  if (tokenContract) {
    return await tokenContract.allowance(ownerAddress, marketContractAddress)
  } else {
    return toBigNumber(0)
  }
}

export const useGetZoomAllowanceQuery = (userAddress, zoomTokenContract) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.zoomAllowance,
      { zoomTokenContract: zoomTokenContract?.address, userAddress },
    ],
    queryFn: () => getUserTokenAllowance(zoomTokenContract, userAddress),
    refetchOnWindowFocus: false,
  })

export const useCheckIsItemSettledQuery = (itemNumber, marketContract) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.isSettled,
      { marketContract: marketContract?.address, itemNumber },
    ],
    queryFn: () => isItemSettled(itemNumber, marketContract),
    refetchOnWindowFocus: false,
  })
