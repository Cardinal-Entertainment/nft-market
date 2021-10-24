import axios from "axios";
import { ethers } from "ethers";
import moment from "moment";

import { zoomContractAddress, wmovrContractAddress } from "../constants";
import getCardData from "./getCardData";

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
    const item = await axios.get(`https://cryptoz.cards:5000/item/${auctionId}`)
    console.log({ item });
    const { tokenIds, saleToken, highestBidder, highestBid, lister: seller, minPrice, auctionStart, auctionEnd } = item.data;

    const getCardPromise = tokenIds.map(async (token) => {
      const tokenId = token.toNumber();
      const cardData = getCardData(tokenId, zoombiesContract);
      return cardData;
    });

    const cards = await Promise.all(getCardPromise);

    let currency;
    if (saleToken === zoomContractAddress) {
      currency = "ZOOM";
    } else if (saleToken === wmovrContractAddress) {
      currency = "WMOVR";
    }

    return {
      id: auctionId,
      cards,
      auctionStart,
      auctionEnd,
      currency,
      minPrice,
      highestBid,
      highestBidder,
      seller,
    };
  } catch (err) {
    console.error(err);
  }
};

export const getAuctionListings = async (marketContract, zoombiesContract, filters, sorting) => {
  console.log({filters, sorting})

  const getSortType = () => {
    switch(sorting.field) {
      case 'auctionEnd':
        return 'END_TIME' 
      case 'minPrice':
        return 'MIN_PRICE' 
      case 'highestBid':
        return 'HIGHEST_BID'
      case '':
        return null
      default:
        throw new Error(`Unhandled sort type: ${sorting.field}`)
    }
  }

  const params = new URLSearchParams({
    cardOrigin: filters.cardType,
    saleToken: filters.token,
    cardRarity: filters.rarity,
    search: filters.keyword,
    sortBy: getSortType(),
    orderBy: sorting.order,
  })
  
  const listings = await axios.get(`https://cryptoz.cards:5000/listings?${params.toString()}`)
  console.log({listings})

  return listings.data
};

export const getOffers = async (auctionId) => {
  const res = await axios.get(`https://cryptoz.cards:5000/bids/${auctionId}`)

  return res.data
}
