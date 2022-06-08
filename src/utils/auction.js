import { apiEndpoint, CURRENCY_TYPES, NETWORKS } from '../constants'
import moment from 'moment'
import { ethers } from 'ethers'

export const getTokenSymbol = (saleToken, networkName) => {
  const {
    zoomContractAddress,
    wmovrContractAddress,
    usdtContractAddress,
    daiContractAddress,
    usdcContractAddress,
  } = NETWORKS[networkName]
  switch (saleToken) {
    case zoomContractAddress:
      return 'ZOOM'
    case wmovrContractAddress:
      return 'MOVR'
    case usdtContractAddress:
      return 'USDT'
    case daiContractAddress:
      return 'DAI'
    case usdcContractAddress:
      return 'USDC'
    default:
      return 'Unknown'
  }
}

export const isItemSettled = async (itemNumber, marketContract) => {
  if (!marketContract) {
    return null
  }
  try {
    const itemFromChain = await marketContract.getListItem(itemNumber)
    const isItemSettled =
      itemFromChain === undefined ||
      itemFromChain.seller === '0x0000000000000000000000000000000000000000'
        ? true
        : false

    return isItemSettled
  } catch (err) {
    console.error(err)
    return false
  }
}

export const getStatus = (endTime, highestBidder, address) => {
  const now = moment().unix()
  const end = moment(endTime).unix()

  if (end < now) {
    if (highestBidder === address) {
      return {
        label: 'You Won!',
        color: 'success',
      }
    }
    return {
      label: 'Completed',
      color: 'success',
    }
  }
  if (end - now < 86400) {
    return {
      label: 'Ending Soon',
      color: 'warning',
    }
  }
  return {
    label: 'Ongoing',
    color: 'secondary',
  }
}

export const fetchHighestBids = async (itemNumber, chainId) => {
  try {
    const result = await fetch(
      `${apiEndpoint}/bids/highest/${itemNumber}?chainId=${chainId}`
    )

    if (result.ok) {
      const json = await result.json()
      return json
    }

    return null
  } catch (error) {
    console.error('Failed to fetch highest bids: ', error)
  }
}

export const getMinOfferAmount = (auctionItem, coinType, minIncrement) => {
  if (coinType === CURRENCY_TYPES.USDC) {
    return auctionItem.numBids === 0
      ? ethers.utils
          .parseEther(auctionItem.minPrice.toString())
          .add(minIncrement)
      : ethers.utils
          .parseEther(auctionItem.highestBid.toString())
          .add(minIncrement)
  }

  return auctionItem.numBids === 0
    ? ethers.utils
        .parseEther(auctionItem?.minPrice.toString())
        .add(minIncrement)
    : ethers.utils
        .parseEther(auctionItem?.highestBid.toString())
        .add(minIncrement)
}

// TODO(mchi): Modify this method so it checks query cache first.
export const getListingItemFromAPI = async (itemNumber, chainId) => {
  const result = await fetch(
    `${apiEndpoint}/item/${itemNumber}?chainId=${chainId}`
  )

  if (result.ok) {
    const json = await result.json()
    return json
  }

  return null
}
