import zoombiesLogo from './assets/zoombies_logo.svg'
import nextGemLogo from './assets/NextGem.png'
import zoombiesContractJSON from './contracts/Zoombies.json'
import anyNFTJson from './contracts/AnyNFT.json'

export const isLocal = process.env.NODE_ENV === 'development'

export const NETWORK_NAMES = {
  MOONBASE: 'moonbase-alpha',
  MOONRIVER: 'moonriver',
  MOONBEAM: 'moonbeam',
}

export const CHAIN_ID_TO_NETWORK = {
  1287: NETWORK_NAMES.MOONBASE,
  1285: NETWORK_NAMES.MOONRIVER
}

export const NETWORKS = {
  'moonbase-alpha': {
    name: NETWORK_NAMES.MOONBASE,
    chainId: 1287,
    websocketRPC: `wss://moonbeam-alpha.api.onfinality.io/ws?apikey=${process.env['REACT_APP_MOONBEAM_RPC_API_KEY']}`,
    httpRPC: `https://moonbeam-alpha.api.onfinality.io/rpc?apikey=${process.env['REACT_APP_MOONBEAM_RPC_API_KEY']}`,
    marketContractAddress: '0xd00d7b22deD10Fde1c94Be9E6D55D7190CCADD7F',
    zoomContractAddress: '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316',
    zoombiesContractAddress: '0x3E7997B8D30AA6216102fb2e9206246e478d57d3',
    wmovrContractAddress: '0x372d0695E75563D9180F8CE31c9924D7e8aaac47',
    usdtContractAddress: '0x0b77D7BDd78b2a4C2c50980968166D99e321DfB6',
    daiContractAddress: '0xEc95c10d4DD55741DE9491751407DEA41A3eF5f1',
  },
  moonriver: {
    name: NETWORK_NAMES.MOONRIVER,
    chainId: 1285,
    websocketRPC: `wss://moonriver.api.onfinality.io/ws?apikey=${process.env['REACT_APP_MOONBEAM_RPC_API_KEY']}`,
    httpRPC: `https://moonriver.api.onfinality.io/rpc?apikey=${process.env['REACT_APP_MOONBEAM_RPC_API_KEY']}`,
    marketContractAddress: '0x0705212aeAA5d0b91c995269863856B2A17874a8',
    zoomContractAddress: '0x8bd5180Ccdd7AE4aF832c8C03e21Ce8484A128d4',
    zoombiesContractAddress: '0x08716e418e68564C96b68192E985762740728018',
    wmovrContractAddress: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    xcKSMContractAddress: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    xcUSDTContractAddress: '0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d',
    usdtContractAddress: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    daiContractAddress: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
  },
}

export const NFT_CONTRACTS = {
  'moonbase-alpha': [
    {
      name: 'Zoombies',
      address: '0x3E7997B8D30AA6216102fb2e9206246e478d57d3',
      icon: zoombiesLogo,
      abiJSON: zoombiesContractJSON,
    },
    {
      name: 'NextGem',
      address: '0x4c0EaC154AE7cB755b260E835895e9F471B640f3',
      icon: nextGemLogo,
      abiJSON: anyNFTJson,
    },
  ],
}

export const METAMASK_CHAIN_PARAMS = {
  'moonbase-alpha': {
    chainId: '0x507', // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
    chainName: 'Moonbase Alpha',
    nativeCurrency: {
      name: 'DEV',
      symbol: 'DEV',
      decimals: 18,
    },
    rpcUrls: [NETWORKS['moonbase-alpha'].httpRPC],
    blockExplorerUrls: ['https://moonbase.moonscan.io/'],
  },
  moonriver: {
    chainId: '0x505', // Moonriver's chainId is 1285, which is 0x505 in hex
    chainName: 'Moonriver',
    nativeCurrency: {
      name: 'MOVR',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: [NETWORKS.moonriver.httpRPC],
    blockExplorerUrls: ['https://moonriver.moonscan.io/'],
  },
}

export const cardImageBaseURL = 'https://moonbase.zoombies.world/nft-image'
export const apiEndpoint = 'https://api.zoombies.world'
// export const apiEndpoint = 'http://localhost:3001';

export const ZoombiesTestingEndpoint = `https://moonbase.zoombies.world`
export const ZoombiesStableEndpoint = 'https://movr.zoombies.world'
export const maxZOOMAllowance = 999999999999 // 10^13-1

export const EVENT_TYPES = {
  Bid: 'Bid',
  ItemListed: 'ItemListed',
  Settled: 'Settled',
}

export const QUERY_KEYS = {
  listings: 'fetchListings',
  listing: 'fetchSingleListing',
  bids: 'fetchBids',
  profile: 'fetchUserProfile',
  userNFT: 'fetchUserNFT',
  zoomAllowance: 'fetchUserZoomAllowance',
  isSettled: 'checkIsItemSettled',
}
