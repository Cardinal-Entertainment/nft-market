import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useEventScraper = ({ auctionId, currency, MarketContract }) => {
  const [offers, setOffers] = useState([]);

  const getBidEvents = async () => {
    const bidFilter = MarketContract.filters.Bid();
    const events = await MarketContract.queryFilter(bidFilter, -10000);
    console.log({ events });

    setOffers(
      (
        await Promise.all(
          events.map(async (event) => ({
            ...event.decode(event.data, event.topics),
            block: await event.getBlock(),
          }))
        )
      )
        .filter((event) => event.itemNumber.toString() === auctionId)
        .map((event, i) => ({
          id: i,
          date: new Date(event.block.timestamp * 1000).toLocaleString(),
          from: `${event.bidder.substr(0, 8)}...${event.bidder.substr(36)}`,
          amount: `${ethers.utils.formatEther(event.bidAmount)} ${currency}`,
          status: "Offer",
        }))
    );
  };

  useEffect(() => {
    if (MarketContract && currency) {
      getBidEvents();
    }
  }, [MarketContract, currency]);

  return {
    offers,
    refetchOffers: getBidEvents,
  };
};

export default useEventScraper;
