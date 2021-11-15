import { ethers } from "ethers"
const rpcProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.moonbeam.network"
  // "https://moonbase-alpha-api.bwarelabs.com/d6e703e6-a9d9-41bd-ab0a-5b96fae88395"
)

export const marketContractJSON = require("../contracts/ZoombiesMarketPlace.json")
export const marketContractAddress = "0x9362e967ae25891a799a39F42669C627c3D8eFD6"

export const zoomContractAddress = "0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316"

export const zoombiesContractJSON = require("../contracts/Zoombies.json")
export const zoombiesContractAddress = "0x3E7997B8D30AA6216102fb2e9206246e478d57d3"

export const marketContract = new ethers.Contract(
  marketContractAddress,
  marketContractJSON.abi,
  rpcProvider
)

export const zoombiesContract = new ethers.Contract(
  zoombiesContractAddress,
  zoombiesContractJSON.abi,
  rpcProvider
)

export const EVENT_TYPES = {
  Bid: "Bid",
  ItemListed: "ItemListed",
}
