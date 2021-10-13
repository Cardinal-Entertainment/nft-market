import axios from "axios";
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
export const getAuctionItems = async (
  auctionId,
  marketContract,
  zoombiesContract
) => {
  try {
    const item = await marketContract.getListItem(auctionId);
    console.log({ item });
    const tokenIds = item.tokenIds;
    const salesToken = item.saleToken;
    const minPrice = item.minPrice.toString();
    const highestBid = item.highestBid.toString();

    const getCardPromise = tokenIds.map(async (token) => {
      const tokenId = token.toNumber();
      const cardData = getCardData(tokenId, zoombiesContract);
      return cardData;
    });

    const cards = await Promise.all(getCardPromise);

    const auctionEnd = item.auctionEnd.toString();
    const auctionEndDate = moment.unix(auctionEnd);

    let currency;
    if (salesToken === zoomContractAddress) {
      currency = "ZOOM";
    } else if (salesToken === wmovrContractAddress) {
      currency = "MOVR";
    }

    return {
      cards,
      auctionEnd: auctionEndDate,
      currency,
      minPrice,
      highestBid,
      id: auctionId,
    };
  } catch (err) {
    console.error(err);
  }
};

export const getAuctionListings = async (marketContract, zoombiesContract) => {
  // TODO: filter events for all past listings
  const itemCount = await marketContract.itemCount();
  console.log({ itemCount });
  const listings = [];

  for (let i = 0; i < itemCount; i++) {
    const auctionItem = await getAuctionItems(
      i,
      marketContract,
      zoombiesContract
    );
    listings.push(auctionItem);
  }

  return listings;
};
