import React, {useContext, useEffect, useState} from "react";
import { forwardRef }from "react";
import { styled } from '@mui/material';

import iconNew from '../assets/new.png'
import iconMyNew from '../assets/mynew.png'
import iconBid from '../assets/bid.png'
import iconMyBid from '../assets/mybid.png'
import iconMyBidOn from '../assets/mybidon.png'
import iconMyOutBid from '../assets/myoutbid.png'
import iconSettle from '../assets/settle.png'
import iconWin from '../assets/win.png'
import iconSold from '../assets/sold.png'
import wmovrCoin from "../assets/movr_logo.png";
import zoomCoin from "../assets/zoombies_coin.svg";

import moment from "moment";
import {useHistory} from "react-router-dom";
import {formatAddress} from "../utils/wallet";
import {store} from "../store/store";

const StyledDiv = styled('div')({
  // '& .container-highlight': {
  //   backgroundColor: '#788ea5'
  // }

  animation: 'mymove 5s infinite'
});

const Container = styled('div')(({ type }) => ({
  color: 'white',
  display: 'flex',
  margin: '6px 0',
  transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  borderRadius: '8px',
  border: '1px solid rgb(30, 73, 118)',
  overflow: 'hidden',
  padding: '8px',
  minHeight: '120px',

  // backgroundColor: type === 'highlight' ? '#788ea5' : 'rgb(0, 30, 60)'
  backgroundColor: type === 'highlight' ? '#ff59e8' : '#41f7f8'

}))

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

  const { type, content, timestamp, highlight } = props
  const { itemNumber, lister, bidder, seller, winner, minPrice, bidAmount, auctionEnd, currency } = content

  const listerAddress = formatAddress(lister)
  const sellerAddress = formatAddress(seller)
  const bidderAddress = formatAddress(bidder)
  const winnerAddress = formatAddress(winner)

  const [elapsedTime, setElapsedTime] = useState(moment.unix(timestamp).fromNow())
  const history = useHistory();
  const {
    state: { wallet },
  } = useContext(store);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      updateElapsedTime()
    }, 60000); //update every minute
  }, []);

  const updateElapsedTime = () => {
    setElapsedTime(moment.unix(timestamp).fromNow());
  }

  const gotoAuction = () => {
    history.push(`/listing/${itemNumber}`);
  }

  return (
    <StyledDiv>
      <Container ref={ref} {...props} className={highlight === 'true' ? 'container-highlight' : ''} type={!(type === 'new' || type === 'bid' || type === 'settled') ? 'highlight' : ''}>
        <ImgEvent>
          {
            (type === 'new') ? (
              <img src={iconNew} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (type === 'mynew') ? (
              <img src={iconMyNew} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (type === 'bid') ? (
              <img src={iconBid} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (type === 'mybidon') ? (
              <img src={iconMyBidOn} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (type === 'mybid') ? (
              <img src={iconMyBid} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : (type === 'settled' || type === 'settlemybid') ? (
              <img src={iconSettle} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : type === 'myoutbid' ? (
              <img src={iconMyOutBid} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : type === 'sold' ? (
              <img src={iconSold} alt={type} style={
                {
                  width: '32px',
                  height: '32px',
                }
              }/>
            ) : type === 'win' ? (
              <img src={iconWin} alt={type} style={
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
              {elapsedTime}
            </div>
          </Header>
          <ContentBody>
            {
              type === 'new' ? (
                <>
                  <div className={'content-wallet-address'}>{listerAddress + ' started a new auction.'}</div>
                  <div className={'content-amount'}>Min Price: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{minPrice}</span> {currency}</div>
                  <div className={'content-auction-end'}>Auction Ends at: <span>{moment.unix(auctionEnd).format("MM/DD/YYYY, h:mm:ss A")}</span></div>
                </>
              ) : type === 'mynew' ? (
                <>
                  <div className={'content-wallet-address'}>You've created a new auction.</div>
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
              ) : type === 'mybid' ? (
                <>
                  <div className={'content-wallet-address'}>You've placed a new bid</div>
                  <div className={'content-amount'}>Bid Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'mybidon' ? (
                <>
                  <div className={'content-wallet-address'}>{bidderAddress + ' placed a new bid on your auction.'}</div>
                  <div className={'content-amount'}>Bid Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'myoutbid' ? (
                <>
                  <div className={'content-wallet-address'}>You've been outbid by {bidderAddress}</div>
                  <div>Increase your bid to win this auction.</div>
                  <div className={'content-amount'}>Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'settled' ? (
                <>
                  <div className={'content-wallet-address'}>Winner: {winnerAddress}</div>
                  <div>{'This auction has been settled.'}</div>
                  <div className={'content-amount'}>Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'sold' ? (
                <>
                  <div className={'content-wallet-address'}>Winner: {winnerAddress}</div>
                  <div>{'Your auction ended and you sold your card.'}</div>
                  <div className={'content-amount'}>Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'settlemybid' ? (
                <>
                  <div className={'content-wallet-address'}>Winner: {winnerAddress}</div>
                  <div>You've placed a bid on this auction and it is settled.</div>
                  <div className={'content-amount'}>Amount: <img className="content-coin" src={currency === 'ZOOM' ? zoomCoin : wmovrCoin} alt={currency}/>
                    <span className={'span-amount'}>{bidAmount}</span> {currency}</div>
                </>
              ) : type === 'win' ? (
                <>
                  <div className={'content-wallet-address'}>You WIN in this auction.</div>
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
