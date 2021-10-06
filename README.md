# nft-market
Dapp for custom Cryptoz platform NFT market

Moonbase NFT market - https://moonbase-blockscout.testnet.moonbeam.network/address/0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7/transactions

WMOVR ( wrapped movr) contract - 0x372d0695E75563D9180F8CE31c9924D7e8aaac47

ZOOM contract - 0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316

Zoombies contract - 0x3E7997B8D30AA6216102fb2e9206246e478d57d3


---
Before Listing or bidding, the user must set Approvals for the market contract on the NFTs and the saleToken contracts.

the dapp must call and get confirmed:
zoombiesInstance.setApprovalForAll("0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7", true)

---
then it can call the exposed contract methods:

Payable with saleToken ZOOM or WMOVR
listItem(
    auctionEnd,
    minPrice,
    nftTokenIds[],
    saleToken
)


payable matching the list saleToken
bid(
    itemNumber,
    bidAmount
)


After auctionEnd
settle {
  itemNumber
}
