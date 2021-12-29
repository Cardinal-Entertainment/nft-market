import {
  zoomContractAddress,
  wmovrContractAddress,
  apiEndpoint,
} from '../constants'
import axios from 'axios'

export const getTokenSymbol = (saleToken) => {
  switch (saleToken) {
    case zoomContractAddress:
      return 'ZOOM'
    case wmovrContractAddress:
      return 'MOVR'
    default:
      return 'Unknown'
  }
}

/**
 *
 * @param {number} auctionId
 * @param marketContract
 * @param  zoombiesContract
 *
 * @returns Array of cards for an auction listing.
 */
export const getAuctionItem = async (auctionId, zoombiesContract) => {
  try {
    const item = await axios.get(`${apiEndpoint}/item/${auctionId}`)
    // const item = await axios.get(`http://localhost:3001/item/${auctionId}`)
    const {
      tokenIds,
      saleToken,
      highestBidder,
      highestBid,
      lister: seller,
      minPrice,
      auctionStart,
      auctionEnd,
    } = item.data

    const currency = getTokenSymbol(saleToken)

    return {
      id: auctionId,
      tokenIds,
      auctionStart,
      auctionEnd,
      currency,
      minPrice,
      highestBid,
      highestBidder,
      seller,
      saleToken,
    }
  } catch (err) {
    console.error(err)
  }
}

export const getOffers = async (auctionId) => {
  const res = await axios.get(`${apiEndpoint}/bids/${auctionId}`)
  // const res = await axios.get(`http://localhost:3001/bids/${auctionId}`)

  return res.data.map((offer) => ({
    date: offer.timestamp,
    from: offer.bidder,
    amount: offer.bidAmount,
    status: 'Bid',
  }))
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
