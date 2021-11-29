
export const marketContractJSON = require('./contracts/ZoombiesMarketPlace.json');
export const marketContractAddress =
  '0x9362e967ae25891a799a39F42669C627c3D8eFD6';

export const zoomContractAddress = '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316';

export const zoombiesContractJSON = require('./contracts/Zoombies.json');
export const zoombiesContractAddress =
  '0x3E7997B8D30AA6216102fb2e9206246e478d57d3';

export const wmovrContractAddress =
  '0x372d0695E75563D9180F8CE31c9924D7e8aaac47';

export const cardImageBaseURL = 'https://moonbase.zoombies.world/nft-image';
export const apiEndpoint = 'https://api.zoombies.world';

export const ZoombiesTestingEndpoint = `https://moonbase.zoombies.world`;
export const ZoombiesStableEndpoint = 'https://movr.zoombies.world';

export const EVENT_TYPES = {
  Bid: 'Bid',
  ItemListed: 'ItemListed',
};

export const QUERY_KEYS = {
  listings: "fetchListings",
  bids: "fetchBids",
  profile: "fetchUserProfile",
}
