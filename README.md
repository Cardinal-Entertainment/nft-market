# nft-market

## Dev

To enable hot reload: Create a .env file at the root of the project and paste the following: `FAST_REFRESH=false`

To install packages: `yarn`
To run the app locally: `yarn start`

## About

Dapp for custom Cryptoz platform NFT market

Moonbase NFT market 0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7 - https://moonbase-blockscout.testnet.moonbeam.network/address/0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7/transactions

WMOVR ( wrapped movr) contract - 0x372d0695E75563D9180F8CE31c9924D7e8aaac47

ZOOM contract - 0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316

Zoombies contract - 0x3E7997B8D30AA6216102fb2e9206246e478d57d3


---
Before Listing or bidding, the user must set Approvals for the market contract on the NFTs and the saleToken contracts.

For a seller, the dapp must call and get confirmed:

zoomInstance.setApprovalForAll("0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7", true)
zoombiesInstance.setApprovalForAll("0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7", true)



---
then it can call the exposed contract methods:

Payable with saleToken ZOOM or WMOVR
marketInstance.listItem(
    auctionEnd, ( in seconds )
    minPrice,
    nftTokenIds[],
    saleToken
)

payable matching the list saleToken
marketInstance.bid(
    itemNumber,
    bidAmount
)

After auctionEnd
marketInstance.settle {
  itemNumber
}

--
READ-ONLY:

marketInstance.itemCount();
RETURNS uint256

marketInstance.Items(itemNumber);
RETURNS
struct Item {
        uint256 auctionEnd;
        uint256 minPrice;
        address saleToken;
        address seller;
        address highestBidder;
        uint256[] tokenIds;
        uint256 highestBid;
    }