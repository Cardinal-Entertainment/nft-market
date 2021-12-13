import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  color: white;
  overflow-y: auto;
  padding: 12px;
  h2 {
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
      <h2>No Commission Market !</h2>
      <p>
        Never pay a Sale commission, the ZOOM Market will NEVER take a commission on your NFT sale. For Example:<br />
        If you sell an item for 1 MOVR, a competing NFT market may take anywhere from 0.025 MOVR. Doesn't seem so bad.<br/>
        Now what if you sell an item for 100 MOVR, that is now 2.5 MOVR commission<br />
        or what if you wanted to list 100 items for 1 movr each 0.025 x 100 = 2.5 MOVR.<br />
        We want <strong>you</strong> to keep that commission. You worked hard to sell it, you deserve to keep it :)
      </p>

      <h2>How it works:</h2>
      <p>You can view all listings as long as you are connected to Moonriver.
        Each Auction listing can be bid on before the auction end time. Upon auction end, the bidder who has submitted the highest bid wins the NFT auction.
        If someone bids higher than your bid, you can decide whether to over bid, 1) providing that the bidding time period has not ended and 2) you bid the minimum increment.
        Waiting until the last few seconds of an auction to make a winning bid is known as bid sniping. There is nothing built into the ZOOM Market to prevent sniping.
      </p>

      <h2>Wrapping MOVR</h2>
      <p>Wrapping a coin allows a 3rd party contract, a market in this case, to manage a coin on behalf of the user. The term ‘wrapped’ refers to an original asset that is put in a wrapper, a kind of digital vault.
      To be able to bid on an NFT with MOVR, the Market will automatically wrap it as WMOVR
      If you have sold an NFT(s) in an auction, the Market will automatically unwrap your WMOVR and convert it back to MOVR when you Settle the auction after the auction end date.
      </p>

      <h2>Creating a listing</h2>
      <p>You have to authorize the market (contract) to sell NFT’s on your behalf.
      </p>
      <p>
        To create a new listing:<br />
        Select your card(s) and currency(s) you want to sell for
        Enter the minimum amount you want for the card(s)
        Select an auction end date (max time is 2 weeks)
      </p>

      <h2>After an auction ends</h2>
      <p>
        When an auction has completed, you can settle the funds or item to your wallet by clicking on ""Profile"" and ""Your Listings"". From here, you can click on the green You Won or Completed buttons to settle your item or funds.
      </p>

      <h2>Bidding on a listing</h2>
      <p>
        To bid on a listing, click the “Quick Bid” button and enter the amount you would like to bid.
      </p>

      <h2>Notifications / Alerts</h2>
      <p>
        The alert bell in the top right of the screen tells you when you have new auction notifications to read. Notifications are real time and get reset when you close the app.
      </p>

      <h2>ZOOM Listing Fees</h2>
      <p>
        ZOOM is required to list NFT(s) for auction. The fee is the base ZOOM burn fee x Number of NFTs.
        The total ZOOM listing fee is burned from your wallet upon approval of the amount and confirmation of the listing transaction.
      </p><p>
        The ZOOM listing fee is variable based on the current value and circulating supply of ZOOM. The upper bound of the ZOOM listing fee is 10 Million ZOOM.
      </p><p>
        The current circulating supply of ZOOM is: %ZOOMSUPPLY%<br />
        The current listing fee is: %ZOOMBURN%
      </p><p>
        If you do not have enough ZOOM to list your item, please visit the link below and click on “ZOOM Token” to purchase from the ZOOM exchanges:
         <a href="https://movr.zoombies.world/market" rel="noreferrer" target="_blank">https://movr.zoombies.world/market</a>
      </p>

      <h2>Royalty Fee</h2>
      <p>
        The ZOOM Market honors the EIP-2981 NFT Royalty Standard. The market will identify which approved NFT collections have the royalty enabled.
      </p><p>
        This standard allows contracts, such as NFTs that support ERC-721 and ERC-1155 interfaces, to signal a royalty amount to be paid to the NFT creator or rights holder every time the NFT is sold or re-sold. This is intended for NFT marketplaces that want to support the ongoing funding of artists and other NFT creators. The royalty payment must be voluntary, as transfer mechanisms such as transferFrom() include NFT transfers between wallets, and executing them does not always imply a sale occurred. Marketplaces and individuals implement this standard by retrieving the royalty payment information with royaltyInfo(), which specifies how much to pay to which address for a given sale price. The exact mechanism for paying and notifying the recipient will be defined in future EIPs. This ERC should be considered a minimal, gas-efficient building block for further innovation in NFT royalty payments.
      </p>

      <h4>
      For more information visit :
      <a href={"https://eips.ethereum.org/EIPS/eip-2981"}> https://eips.ethereum.org/EIPS/eip-2981</a>
      </h4>

      <p>
        Want to list your Moonriver NFT collection Or ERC20 token on the ZOOM Market? <a href="https://discord.gg/eDXvJKUZgQ" rel="noreferrer" target="_blank">contact us on Discord</a>.
      </p>

    </Container>
  );
};

export default HelpPage;
