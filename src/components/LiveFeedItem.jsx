import React from "react";
import { forwardRef }from "react";
import { styled } from '@mui/material';

import iconNew from '../assets/new.png'
import iconBid from '../assets/bid.png'
import iconSettle from '../assets/settle.png'
import wmovrCoin from "../assets/movr_logo.png";
import zoomCoin from "../assets/zoombies_coin.svg";

import moment from "moment";
import {useHistory} from "react-router-dom";
import {formatAddress} from "../utils/wallet";

const StyledDiv = styled('div')({
  '& .container-highlight': {
    backgroundColor: '#788ea5'
  }
});

const Container = styled('div')({
  color: 'white',
  display: 'flex',
  margin: '6px 0',
  transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  backgroundColor: 'rgb(0, 30, 60)',
  borderRadius: '8px',
  border: '1px solid rgb(30, 73, 118)',
  overflow: 'hidden',
  padding: '8px',
  height: '120px',
});

const ImgEvent = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px'
});

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 'auto'
});

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',

  '& .content-timestamp': {
    fontSize: '12px',
    fontStyle: 'italic'
  },

  '& .link-to-auction': {
    color: '#f2b705'
  },

  '& .link-to-auction:hover': {
    cursor: 'pointer'
  }
});

const ContentBody = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: '8px',

  '& .content-wallet-address': {
    padding: '4px 0',
    fontWeight: 'bold'
  },

  '& .content-auction-end': {
    fontSize: '14px'
  },

  '& .content-amount': {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',

    '& .content-coin': {
      width: '24px',
      height: '24px',
      padding: '0 4px',
    }
  },

  '& .span-amount': {
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 4px',
  }


});

const LiveFeedItem = ( props, ref  ) => {

  const history = useHistory();
  const { type, content, timestamp, highlight } = props
  const { itemNumber, bidder, seller, winner, minPrice, bidAmount, auctionEnd, currency } = content

  const sellerAddress = formatAddress(seller)

  const bidderAddress = formatAddress(bidder)

  const winnerAddress = formatAddress(winner)

  const gotoAuction = () => {
    history.push(`/listing/${itemNumber}`);
  }

  return (
    <StyledDiv>
      <Container ref={ref} {...props} className={highlight === 'true' ? 'container-highlight' : ''}>
        <ImgEvent>
          {
            type === 'new' ? (
              <img src={iconNew} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : type === 'bid' ? (
              <img src={iconBid} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : type === 'settled' ? (
              <img src={iconSettle} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (<></>)
          }
        </ImgEvent>
        <Content>
          <Header>
            <span className={'link-to-auction'} onClick={gotoAuction}>
              Auction #{itemNumber}
            </span>
            <div className={'content-timestamp'}>
              {moment.unix(timestamp).fromNow()}
            </div>
          </Header>
          <ContentBody>
            {
              type === 'new' ? (
                <>
                  <div className={'content-wallet-address'}>{sellerAddress + ' started a new auction.'}</div>
                  <div className={'content-amount'}>Min Price: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{minPrice}</span> {currency}</div>
                  <div className={'content-auction-end'}>Auction Ends at: <span>{moment.unix(auctionEnd).format("MM/DD/YYYY, h:mm:ss A")}</span></div>
                </>
              ) : type === 'bid' ? (
                <>
                  <div className={'content-wallet-address'}>{bidderAddress + ' placed a new bid.'}</div>
                  <div className={'content-amount'}>Bid Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'settled' ? (
                <>
                  <div className={'content-wallet-address'}>Winner: {winnerAddress}</div>
                  <div>{'This auction has been settled.'}</div>
                  <div className={'content-amount'}>Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : (<></>)
            }
          </ContentBody>
        </Content>
      </Container>
    </StyledDiv>
  );
};

export default forwardRef(LiveFeedItem);
