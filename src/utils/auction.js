import { zoomContractAddress, wmovrContractAddress } from "../constants";
import axios from 'axios'

export const getTokenSymbol = (saleToken) => {
  switch (saleToken) {
    case zoomContractAddress:
      return "ZOOM"
    case wmovrContractAddress:
      return "WMOVR"
    default:
      return "Unknown"
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
export const getAuctionItem = async (
  auctionId,
  zoombiesContract
) => {
  try {
    const item = await axios.get(`https://api.zoombies.world/item/${auctionId}`)
    // const item = await axios.get(`http://localhost:3001/item/${auctionId}`)
    const { tokenIds, saleToken, highestBidder, highestBid, lister: seller, minPrice, auctionStart, auctionEnd } = item.data;

    const currency = getTokenSymbol(saleToken);
    
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
      saleToken
    };
  } catch (err) {
    console.error(err);
  }
};

export const getOffers = async (auctionId) => {
  const res = await axios.get(`https://api.zoombies.world/bids/${auctionId}`)
  // const res = await axios.get(`http://localhost:3001/bids/${auctionId}`)

  return res.data.map((offer) => ({
    date: offer.timestamp,
    from: offer.bidder,
    amount: offer.bidAmount,
    status: "Bid",
  }))
}
