import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  color: white;

  h1 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  a {
    color: cyan;
  }
`;

const HelpPage = () => {
  return (
    <Container>
      <h1>How it works:</h1>

      You can view all listings as long as you are connected to Moonriver.

      Each listing can be bid on for a defined time period. At the end of this period, the bidder who has submitted the highest bid wins the lot, provided the bid exceeds the minimum price.

      If someone bids higher than your bid, you can decide whether to bid more, providing that the bidding time period has not ended.

      Waiting until the last few seconds of an auction to make a winning bid is known as bid sniping. There is nothing built into the zombies auction to prevent sniping.

      <h1>Wrapping MOVR</h1>

      Coins that exist on a given blockchain can't be simply transferred to another. The term ‘wrapped’ refers to an original asset that is put in a wrapper, a kind of digital vault.

      To be able to bid on an NFT for MOVR you have to wrap it into WMOVR

      If you have sold a card(s) in the auction, you will need to unwrap your WMOVR to convert it back to MOVR.

      Add WMOVR to Metamask
      Add ZOOM to Metamask

      <h1>Creating a listing</h1>

      You have to authorize the market (contract) to sell NFT’s on your behalf.

      To create a new listing:
      Select your card(S) and currency(s) you want to sell for
      Enter the minimum amount you want for the card(s)
      Select an auction end date (max time is 2 weeks)

      <h1>After an auction ends</h1>
      When an auction has completed, you can settle the funds or item to your wallet by clicking on ""Profile"" and ""Your Listings"". From here, you can click on the green You Won or Completed buttons to settle your item or funds.

      <h1>Bidding on a listing</h1>

      To bid on a listing, click the “Quick Bid” button and enter the amount you would like to bid.

      <h1>Notifications / Alerts</h1>

      The alert bell in the top right of the screen tells you when you have new auction notifications to read. Notifications are real time and get reset when you close the app.

      <h1>ZOOM Listing Fees</h1>

      ZOOM is required to list an item in the auction. The ZOOM listing fee is burned upon confirmation of the listing transaction.

      The ZOOM listing fee is variable based on the current value and circulating supply of ZOOM. The upper bound of the ZOOM listing fee is 10 Million ZOOM.

      The current circulating supply of ZOOM is: %ZOOMSUPPLY%
      The current listing fee is: %ZOOMBURN%

      If you do not have enough ZOOM to list your item, please visit the link below and click on “ZOOM Token” to purchase from the ZOOM exchanges:
      https://movr.zoombies.world/market


      <h1>Royalty Fee</h1>

      Our market honors the NFT Royalty Standard. The market will identify which tokens have the royalty enabled.

      This standard allows contracts, such as NFTs that support ERC-721 and ERC-1155 interfaces, to signal a royalty amount to be paid to the NFT creator or rights holder every time the NFT is sold or re-sold. This is intended for NFT marketplaces that want to support the ongoing funding of artists and other NFT creators. The royalty payment must be voluntary, as transfer mechanisms such as transferFrom() include NFT transfers between wallets, and executing them does not always imply a sale occurred. Marketplaces and individuals implement this standard by retrieving the royalty payment information with royaltyInfo(), which specifies how much to pay to which address for a given sale price. The exact mechanism for paying and notifying the recipient will be defined in future EIPs. This ERC should be considered a minimal, gas-efficient building block for further innovation in NFT royalty payments.

      <h4>
      For more information visit :
      <a href={"https://eips.ethereum.org/EIPS/eip-2981"}> https://eips.ethereum.org/EIPS/eip-2981</a>
      </h4>

    </Container>
  );
};

export default HelpPage;
