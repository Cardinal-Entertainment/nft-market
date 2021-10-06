# nft-market
Dapp for custom Cryptoz platform NFT market

Moonbase NFT market - https://moonbase-blockscout.testnet.moonbeam.network/address/0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7/transactions

WMOVR ( wrapped movr) contract - 0x372d0695E75563D9180F8CE31c9924D7e8aaac47
Zoombies contract - 0x3E7997B8D30AA6216102fb2e9206246e478d57d3

Exposed contract methods:

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
