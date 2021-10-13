import axios from "axios";
import moment from "moment";

import {
    zoomContractAddress,
    wmovrContractAddress
} from '../constants'

/**
 * 
 * @param {number} auctionId 
 * @param marketContract 
 * @param  zoombieContract 
 * 
 * @returns Array of cards for an auction listing.
 */
export const getAuctionItems = async (auctionId, marketContract, zoombieContract) => {
    try {
        const item = await marketContract.getListItem(0);
        const tokenIds = item.tokenIds;
        const salesToken = item.saleToken;
        const minPrice = item.minPrice.toString();
        const highestBid = item.highestBid.toString();

        const getCardPromise = tokenIds.map(async token => {
            const tokenId = token.toNumber();
            const tokenUrl = await zoombieContract.tokenURI(tokenId)

            return (await axios.get(tokenUrl)).data
        });

        const cards = await Promise.all(getCardPromise);

        const auctionEnd = item.auctionEnd.toString();
        const auctionEndDate = moment.unix(auctionEnd).format("MM/DD/YYYY, HH:mm:ss A")

        let currency;
        if (salesToken === zoomContractAddress) {
            currency = 'ZOOM'
        } else if (salesToken === wmovrContractAddress) {
            currency = 'MOVR'
        }

        return {
            cards,
            acutionEnd: auctionEndDate,
            currency: currency,
            minPrice,
            highestBid
        };
    } catch (err) {
        console.error(err);
    }
}

export const getAuctionListings = async (marketContract, zoombieContract) => {
    // TODO: filter events for all past listings
    const itemCount = await marketContract.itemCount()
    const listings = [];

    for (let i = 0; i < itemCount; i++) {
        const auctionItem = await getAuctionItems(i, marketContract, zoombieContract);
        listings.push(auctionItem)
    }

    return listings;
}