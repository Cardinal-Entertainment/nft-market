import { useQuery } from 'react-query'
import axios from 'axios'
import { ethers } from 'ethers'
import { apiEndpoint, NETWORKS, QUERY_KEYS } from '../constants'
import { getCardData } from 'utils/cardsUtil'
import { isItemSettled } from 'utils/auction'
import { toBigNumber } from '../utils/BigNumbers'

const getUserProfiles = async (userAddress, chainId) => {
  if (!ethers.utils.isAddress(userAddress)) {
    return null
  }

  if (!chainId) {
    return null
  }

  const response = await axios.get(
    `${apiEndpoint}/profile/${userAddress}?chainId=${chainId}`
  )

  if (response.status !== 200) {
    console.error(response.statusText)
    throw new Error('Failed to get profile.')
  }

  return response.data
}

export const useFetchProfileQuery = (userAddress, chainId) =>
  useQuery({
    queryKey: [QUERY_KEYS.profile, { userAddress, chainId }],
    queryFn: () => getUserProfiles(userAddress, chainId),
    ...{
      refetchOnWindowFocus: false,
    },
  })

const getUserNFTs = async (userAddress, nftContract, marketContract, networkName) => {
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

    const cards = await Promise.all(
      tokensOfOwner.slice(0, 30).map((token) => {
        return getCardData(parseInt(token), nftContract, networkName)
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
  marketContract,
  networkName
) =>
  useQuery({
    queryKey: [
      QUERY_KEYS.userNFT,
      {
        userAddress,
        nftContract: nftContract?.address,
        marketContract: marketContract?.address,
        networkName
      },
    ],
    queryFn: () => getUserNFTs(userAddress, nftContract, marketContract, networkName),
    ...{
      refetchOnWindowFocus: false,
    },
  })

export const getUserTokenAllowance = async (
  tokenContract,
  ownerAddress,
  chainName = 'moonbase-alpha'
) => {
  const marketAddress = NETWORKS[chainName].marketContractAddress
  if (tokenContract) {
    return await tokenContract.allowance(ownerAddress, marketAddress)
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
