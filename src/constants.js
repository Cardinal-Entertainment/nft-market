export const marketContractJSON = require('./contracts/ZoombiesMarketPlace.json');
export const marketContractAddress =
  '0x25EdB1cb586fE53973b7e761C8eC711a89B8ACdF';

export const zoomContractAddress = '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316';

export const zoombiesContractJSON = require('./contracts/Zoombies.json');
export const zoombiesContractAddress =
  '0x3E7997B8D30AA6216102fb2e9206246e478d57d3';

export const wmovrContractAddress =
  '0x372d0695E75563D9180F8CE31c9924D7e8aaac47';

export const usdtContractAddress =
  '0x0b77D7BDd78b2a4C2c50980968166D99e321DfB6';

export const daiContractAddress =
  '0xEc95c10d4DD55741DE9491751407DEA41A3eF5f1';


export const cardImageBaseURL = 'https://moonbase.zoombies.world/nft-image';
export const apiEndpoint = 'https://api.zoombies.world';

export const ZoombiesTestingEndpoint = `https://moonbase.zoombies.world`;
export const ZoombiesStableEndpoint = 'https://movr.zoombies.world';
export const maxZOOMAllowance = 999999999999; // 10^13-1

export const EVENT_TYPES = {
  Bid: 'Bid',
  ItemListed: 'ItemListed',
  Settled: 'Settled',
};

export const QUERY_KEYS = {
  listings: 'fetchListings',
  listing: 'fetchSingleListing',
  bids: 'fetchBids',
  profile: 'fetchUserProfile',
  userNFT: 'fetchUserNFT',
  zoomAllowance: 'fetchUserZoomAllowance',
  isSettled: 'checkIsItemSettled'
};
