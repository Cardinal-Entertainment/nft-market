import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import iconNew from '../assets/new.png'
import iconMyNew from '../assets/mynew.png'
import iconBid from '../assets/bid.png'
import iconMyBid from '../assets/mybid.png'
import iconMyOutBid from '../assets/myoutbid.png'
import iconSettle from '../assets/settle.png'
import iconWin from '../assets/win.png'

import moment from 'moment'
import { Link } from 'react-router-dom'
import { formatAddress } from '../utils/wallet'
import { CURRENCY_ICONS } from '../constants'
import {
  FEED_TYPE,
  OBSERVER_EVENT_TYPES,
  SELF_EVENT_TYPES,
} from '../utils/events'
import '../assets/scss/LiveFeedItem.scss'

const FeedItem = ({
  children,
  eventType,
  type,
  itemIcon,
  networkName,
  itemNumber,
  elapsedTime,
}) => {
  return (
    <div
      className={classNames('live-feed-item-wrapper', {
        'general-live-feeds': eventType === FEED_TYPE.observer,
        'self-live-feeds': eventType === FEED_TYPE.self,
      })}
    >
      <img className="live-feed-icon" alt={type} src={itemIcon} />
      <div className="live-feed-item-data">
        <div className="live-feed-item-metadata">
          <Link
            className="live-feed-item-link"
            to={`/${networkName}/listing/${itemNumber}`}
          >
            Auction #{itemNumber}
          </Link>
          <h3>{elapsedTime}</h3>
        </div>

        {children}
      </div>
    </div>
  )
}

export const ItemListedFeedItem = ({ eventType, timestamp, content }) => {
  const {
    type,
    currency,
    itemNumber,
    networkName,
    lister,
    minPrice,
    auctionEnd,
  } = content

  const [elapsedTime, setElapsedTime] = useState(
    moment.unix(timestamp).fromNow()
  )

  const sellerAddress = formatAddress(lister)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(moment.unix(timestamp).fromNow())
    }, 60000) //update every minute

    return () => clearInterval(interval)
  }, [timestamp])

  const message =
    type === SELF_EVENT_TYPES.selfItemListed
      ? `You have successfully listed this item.`
      : `${sellerAddress} has listed new auction.`

  const icon = type === SELF_EVENT_TYPES.selfItemListed ? iconMyNew : iconNew
  const currencyIcon = CURRENCY_ICONS[currency]

  return (
    <FeedItem
      eventType={eventType}
      type={type}
      itemIcon={icon}
      networkName={networkName}
      elapsedTime={elapsedTime}
      itemNumber={itemNumber}
    >
      <h2>{message}</h2>
      <p>
        Min Price:
        <img className="live-feed-icon" alt={currency} src={currencyIcon} />
        <span>
          {minPrice} {currency}
        </span>
      </p>
      <p>
        Auction Ends at:&nbsp;
        {auctionEnd > 0
          ? moment.unix(auctionEnd).format('MM/DD/YYYY, h:mm:ss A')
          : ' Instant Auction'}
      </p>
    </FeedItem>
  )
}

export const SettleFeedItem = ({ eventType, timestamp, content }) => {
  const { type, currency, itemNumber, winner, networkName, bidAmount } = content

  const winnerAddress = formatAddress(winner)

  const [elapsedTime, setElapsedTime] = useState(
    moment.unix(timestamp).fromNow()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(moment.unix(timestamp).fromNow())
    }, 60000) //update every minute

    return () => clearInterval(interval)
  }, [timestamp])

  const message =
    type === OBSERVER_EVENT_TYPES.otherAuctionWon
      ? `${winnerAddress} has won Auction #${itemNumber}`
      : 'You have won this auction'
  const icon = OBSERVER_EVENT_TYPES.otherAuctionWon ? iconSettle : iconWin
  const currencyIcon = CURRENCY_ICONS[currency]

  return (
    <FeedItem
      eventType={eventType}
      type={type}
      itemIcon={icon}
      networkName={networkName}
      elapsedTime={elapsedTime}
      itemNumber={itemNumber}
    >
      <h2>{message}</h2>
      <p>
        Highest Bid:
        <img className="live-feed-icon" alt={currency} src={currencyIcon} />
        <span>
          {bidAmount} {currency}
        </span>
      </p>
    </FeedItem>
  )
}

export const BidFeedItem = ({ eventType, timestamp, content }) => {
  const { type, currency, itemNumber, bidAmount, bidder, networkName } = content

  const bidderAddress = formatAddress(bidder)

  const [elapsedTime, setElapsedTime] = useState(
    moment.unix(timestamp).fromNow()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(moment.unix(timestamp).fromNow())
    }, 60000) //update every minute

    return () => clearInterval(interval)
  }, [timestamp])

  let bidIcon
  let message
  if (type === SELF_EVENT_TYPES.outBid) {
    bidIcon = iconMyOutBid
    message = `You have been outbid by ${bidderAddress}`
  } else if (type === SELF_EVENT_TYPES.selfBidPlaced) {
    bidIcon = iconMyBid
    message = 'Your bid has been placed'
  } else {
    bidIcon = iconBid
    message = `${bidderAddress} has placed a bid`
  }

  const icon = CURRENCY_ICONS[currency]

  return (
    <FeedItem
      eventType={eventType}
      type={type}
      itemIcon={bidIcon}
      networkName={networkName}
      elapsedTime={elapsedTime}
      itemNumber={itemNumber}
    >
      <h2>{message}</h2>
      <p>
        Amount:
        <img className="live-feed-icon" alt={currency} src={icon} />
        <span>
          {bidAmount} {currency}
        </span>
      </p>
    </FeedItem>
  )
}
