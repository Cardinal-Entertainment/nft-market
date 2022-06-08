import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Button, CircularProgress, Modal, styled, Grid } from '@mui/material'
import {
  QUERY_KEYS,
  NETWORKS,
  CURRENCY_ICONS,
  CURRENCY_TYPES,
} from '../constants'
import { useTheme } from 'styled-components'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import { store } from '../store/store'
import OfferDialog from './OfferDialog'
import { useFetchBids } from 'hooks/useBids'
import { toBigNumber } from '../utils/BigNumbers'
import { waitForTransaction } from 'utils/transactions'
import {
  getUserTokenAllowance,
  useCheckIsItemSettledQuery,
  useGetZoomAllowanceQuery,
} from 'hooks/useProfile'
import { useQueryClient } from 'react-query'
import { getTokenSymbol } from '../utils/auction'
import {
  approveTokenContractAmount,
  getNotEnoughCurrencyTooltip,
  getTokenContract,
  getTokenMinIncrement,
  getWalletBalance,
  isWalletBalanceEnough,
  parseAmountToBigNumber,
} from 'utils/currencies'

const Container = styled(Grid)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',

  background: '#5A5A5A',
  border: '1px solid #FFFFFF',
  boxSizing: 'border-box',
  borderRadius: '4px',
  flex: 'none',
  alignSelf: 'stretch',
  flexGrow: 0,
  margin: '24px 0px',

  '& .meta-header-cards-tip': {
    fontSize: '14px',
    '& span': {
      padding: '0 4px 0 0 ',
    },
  },

  '& .meta-header-bids': {
    color: '#838383',
  },
})

const ModalContent = styled('div')({
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  background: 'white',
  borderRadius: '8px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  '& > *': {
    margin: '5px 0',
  },
})

const MetaDiv = styled(Grid)(({ theme }) => ({
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  minHeight: '272px',
  width: '232px',

  '& .meta-content-coin-icon': {
    width: '24px',
    height: '24px',
    paddingRight: '4px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}))

const MetaHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  borderBottom: 'solid 1px #c4c4c4',

  '& .meta-header-left': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& .meta-header-title': {
      fontSize: '24px',
    },

    '& .meta-header-title:hover': {
      color: '#D400BD',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
  '& .meta-header-right': {
    display: 'flex',
    justifyContent: 'space-between',
  },
})

const MetaContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
})

const CardImage = styled('img')({
  width: '177px',
  height: '270px',
  objectFit: 'contain',
  margin: '0 2px',
})

const MetaContentBidAmount = styled('div')({
  display: 'flex',
  alignItems: 'center',
  fontSize: '24px',
  lineHeight: '1rem',
  margin: '6px 0 0 -4px',

  '& .meta-content-coin-text': {
    alignItems: 'flex-end',
    fontSize: '18px',
    padding: '6px 0 0 4px',
  },
})

const MetaContentRow = styled('div')({
  margin: '8px 0',
  display: 'flex',
  flexDirection: 'column',

  '& button': {
    fontFamily: 'Oswald',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '18px',
    lineHeight: '27px',
    color: 'white',
    backgroundColor: '#D400BD',

    display: 'flex',
    alignItems: 'flex-end',
  },
})

const MetaContentTip = styled('div')({
  fontSize: '12px',
  lineHeight: '1rem',
  color: '#838383',
})

const MetaContentTime = styled('div')({
  display: 'flex',
  alignItems: 'center',
  lineHeight: '1rem',
  '& .meta-content-remaining-time': {
    margin: '0 0 0 4px',
  },
})

const MetaContentButtonSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: 'auto',
  marginBottom: 0,
  justifyContent: 'end',

  '& button': {
    fontFamily: 'Oswald',
    fontStyle: 'normal',
    fontSize: '18px',
    lineHeight: '27px',
    color: 'white',

    display: 'flex',
    alignItems: 'flex-end',
    textTransform: 'capitalize',
    fontWeight: '400',
    justifyContent: 'flex-start',
  },

  '& .button-bid': {
    marginBottom: '2px',
    backgroundColor: '#D400BD',
    width: '100%',
    padding: '6px 8px',
  },

  '& .button-bid.button-readonly': {
    backgroundColor: '#D400BD',
    color: 'rgba(0,0,0,.26)',
  },

  '& .button-more-info': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#474747',
  },

  '& .settle-button': {
    paddingLeft: '8px',
    marginBottom: '4px',
  },
})

const DetailCardsDiv = styled(Grid)(({ theme }) => ({
  flex: 1,
  margin: '0 12px',
  overflowX: 'auto',
}))

const CardsContainer = styled('div')(({ theme }) => ({
  flexGrow: '1',

  display: 'flex',
  minWidth: '177px',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

const DownCounter = ({ timestamp }) => {
  const [remainingTime, setRemainingTime] = useState('')

  const formatTwoPlace = (value) => {
    if (value > 9) {
      return value
    } else {
      return '0' + value
    }
  }

  useEffect(() => {
    const updateRemainingTime = () => {
      const timeDiff = moment.unix(timestamp).diff(moment()) / 1000

      const remainingDays = Math.floor(timeDiff / (3600 * 24))
      const remainingHours = Math.floor((timeDiff % (3600 * 24)) / 3600)
      const remainingMinutes = Math.floor((timeDiff % 3600) / 60)
      const remainingSeconds = Math.floor(timeDiff % 60)

      setRemainingTime(
        formatTwoPlace(remainingDays) +
          'd ' +
          formatTwoPlace(remainingHours) +
          'h ' +
          formatTwoPlace(remainingMinutes) +
          'm ' +
          formatTwoPlace(remainingSeconds) +
          's '
      )
    }

    const interval = setInterval(() => {
      updateRemainingTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamp])

  return (
    <span className={'meta-content-remaining-time'}>
      {moment().isBefore(moment.unix(timestamp))
        ? remainingTime
        : timestamp > 0
        ? moment.unix(timestamp).format('MM/DD/YYYY, h:mm:ss A')
        : 'Buy now'}
    </span>
  )
}

const handleSettle = async (
  marketContract,
  auctionId,
  event,
  setIsSettling,
  queryClient
) => {
  event.stopPropagation()
  try {
    setIsSettling(true)
    const tx = await marketContract.settle(parseInt(auctionId))
    await waitForTransaction(tx)
    setIsSettling(false)
    queryClient.setQueryData(
      [
        QUERY_KEYS.isSettled,
        { itemNumber: auctionId, marketContract: marketContract.address },
      ],
      true
    )
  } catch (err) {
    console.error(err)
    setIsSettling(false)
  }
}

const AuctionItem = ({ content, archived, refresh }) => {
  const { state } = useContext(store)

  const { contracts, wallet } = state
  const history = useHistory()
  const [bidInProgress, setBidInProgress] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [isSettling, setIsSettling] = useState(false)

  const theme = useTheme()

  const {
    itemNumber,
    saleToken,
    numBids,
    highestBid,
    minPrice,
    auctionEnd,
    lister,
    highestBidder,
    _id,
    cards,
  } = content

  const { network } = useParams()
  const marketAddress = NETWORKS[network].marketContractAddress
  const chainId = NETWORKS[network].chainId

  const coinType = getTokenSymbol(saleToken, network)

  const minIncrement = getTokenMinIncrement(saleToken, network, state)
  const parsedMinIncrement = parseAmountToBigNumber(
    minIncrement.toString(),
    saleToken,
    network
  )
  const parsedHighestBid = parseAmountToBigNumber(
    highestBid.toString(),
    saleToken,
    network
  )
  const parsedMinPrice = parseAmountToBigNumber(minPrice, saleToken, network)

  const { data } = useFetchBids(itemNumber, chainId)

  const minOfferAmount =
    numBids > 0
      ? parsedHighestBid.add(parsedMinIncrement)
      : parsedMinPrice.add(parsedMinIncrement)

  const handleConfirmBid = async (amount) => {
    try {
      setBidInProgress(true)
      let currency = content.currency
      if (currency === undefined) {
        currency = getTokenSymbol(saleToken, network)
      }

      const parsedAmount = parseAmountToBigNumber(
        amount.toString(),
        saleToken,
        network
      )

      if (parsedAmount.lt(minOfferAmount)) {
        throw new Error(`Invalid amount valid : ${amount}`)
      }

      if (
        currency !== CURRENCY_TYPES.ZOOM &&
        currency !== CURRENCY_TYPES.MOVR
      ) {
        const tokenContract = getTokenContract(saleToken, network, contracts)

        const allowance = await getUserTokenAllowance(
          tokenContract,
          wallet.address,
          network
        )
        if (allowance.lt(parsedAmount)) {
          await approveTokenContractAmount(
            tokenContract,
            marketAddress,
            parsedAmount
          )
        }
      }

      const bidTx = await contracts.MarketContract.bid(
        parseInt(itemNumber),
        parsedAmount.toString(),
        {
          value: currency === CURRENCY_TYPES.MOVR ? parsedAmount.toString() : 0,
        }
      )
      await waitForTransaction(bidTx)
      refresh()
    } catch (e) {
      console.error(e)
      console.error(e?.data?.message)
    } finally {
      setBidInProgress(false)
    }
  }

  const gotoAuction = () => {
    history.push(`/${network}/listing/${itemNumber}`)
  }

  const { data: zoomAllowance } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract,
    network
  )

  const isAllowanceEnough = zoomAllowance
    ? zoomAllowance.gte(minOfferAmount)
    : false

  // TODO(mchi): Clean this up
  let offerToolTip
  if (moment().isAfter(moment.unix(auctionEnd))) {
    offerToolTip = 'This Auction is ended.'
  }
  if (bidInProgress) {
    offerToolTip = 'Your bid is in processing.'
  }
  if (lister === wallet.address) {
    offerToolTip = 'This is your auction.'
  }
  if (coinType === CURRENCY_TYPES.ZOOM && !isAllowanceEnough) {
    offerToolTip = 'You have not approved enough ZOOM, go to Profile page'
  }

  const notEnoughCurrency = getNotEnoughCurrencyTooltip(
    coinType,
    wallet,
    minOfferAmount
  )

  offerToolTip = notEnoughCurrency ? notEnoughCurrency : offerToolTip

  const now = moment().unix()
  const end = auctionEnd
  const isOver = end < now
  const isWinner = highestBidder === wallet.address
  const isOwner = wallet.address === lister
  const { isLoading: isCheckingSettled, data: isSettled } =
    useCheckIsItemSettledQuery(itemNumber, contracts.ReadOnlyMarketContract)

  const canSettle = isOver && (isWinner || isOwner) && isSettled === false

  const queryClient = useQueryClient()

  const cardImageUrl = NETWORKS[network].imageUrl

  const displayPrice = numBids === 0 ? minPrice : highestBid

  return (
    <Container key={_id} container>
      <MetaDiv>
        <MetaHeader>
          <div className={'meta-header-left'}>
            <div className={'meta-header-title'} onClick={gotoAuction}>
              Auction #{itemNumber}
            </div>
          </div>
          <div className={'meta-header-right'}>
            <div className={'meta-header-cards-tip'}>
              {saleToken !== NETWORKS[network].wmovrContractAddress ? (
                ''
              ) : (
                <>
                  <span style={{ color: theme.colors.epic }}>
                    {
                      cards.filter((card) => {
                        return card.rarity.toLowerCase() === 'epic'
                      }).length
                    }
                    E
                  </span>
                  <span style={{ color: theme.colors.rare }}>
                    {
                      cards.filter((card) => {
                        return card.rarity.toLowerCase() === 'rare'
                      }).length
                    }
                    R
                  </span>
                  <span style={{ color: theme.colors.uncommon }}>
                    {
                      cards.filter((card) => {
                        return card.rarity.toLowerCase() === 'uncommon'
                      }).length
                    }
                    U
                  </span>
                  <span style={{ color: theme.colors.common }}>
                    {
                      cards.filter((card) => {
                        return card.rarity.toLowerCase() === 'common'
                      }).length
                    }
                    C
                  </span>
                </>
              )}
            </div>
            <div className={'meta-header-bids'}>
              {data?.length > 0 ? data.length : 'No'} bids
            </div>
          </div>
        </MetaHeader>
        <MetaContent>
          {auctionEnd !== 0 && (
            <MetaContentRow>
              <MetaContentBidAmount>
                <img
                  className={'meta-content-coin-icon'}
                  src={CURRENCY_ICONS[coinType]}
                  alt={coinType}
                  loading="lazy"
                />
                <span>{displayPrice}</span>
                <span className={'meta-content-coin-text'}>{coinType}</span>
              </MetaContentBidAmount>
              <MetaContentTip>
                {highestBid !== 0 ? 'Highest Bid' : 'Min Price'}
              </MetaContentTip>
            </MetaContentRow>
          )}

          <MetaContentRow>
            <MetaContentTime>
              <FontAwesomeIcon icon={faClock} size="lg" />
              <DownCounter timestamp={auctionEnd} />
            </MetaContentTime>
            <MetaContentTip>
              {!archived ? 'Remaining time' : 'Auction Ended'}
            </MetaContentTip>
          </MetaContentRow>
          <MetaContentButtonSection>
            {(!archived || (archived && auctionEnd === 0 && !isSettled)) && (
              <OfferDialog
                currency={coinType}
                minAmount={minOfferAmount}
                maxAmount={
                  wallet ? getWalletBalance(wallet, coinType) : toBigNumber(0)
                }
                onConfirm={handleConfirmBid}
                disabled={
                  (moment().isAfter(moment.unix(auctionEnd)) &&
                    auctionEnd > 0) ||
                  (auctionEnd === 0 && isSettled) ||
                  bidInProgress ||
                  lister === wallet.address ||
                  (coinType === CURRENCY_TYPES.ZOOM && !isAllowanceEnough) ||
                  !isWalletBalanceEnough(coinType, wallet, minOfferAmount)
                }
                tooltip={offerToolTip}
                mylisting={lister === wallet.address}
                minIncrement={minIncrement}
                quickBid
                timestamp={auctionEnd}
                saleToken={saleToken}
                network={network}
              />
            )}
            {archived &&
              (isCheckingSettled ? (
                <CircularProgress size={20}></CircularProgress>
              ) : canSettle ? (
                <Button
                  disabled={isSettling}
                  onClick={(e) =>
                    handleSettle(
                      contracts.MarketContract,
                      itemNumber,
                      e,
                      setIsSettling,
                      queryClient
                    )
                  }
                  className="settle-button"
                  color="success"
                  variant="contained"
                >
                  {isSettling ? (
                    <CircularProgress size={20}></CircularProgress>
                  ) : (
                    'Settle'
                  )}
                </Button>
              ) : null)}
            <Button className={'button-more-info'} onClick={gotoAuction}>
              More Info
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </Button>
          </MetaContentButtonSection>
        </MetaContent>
      </MetaDiv>

      <DetailCardsDiv>
        <CardsContainer>
          {cards ? (
            cards.map((card) => (
              <CardImage
                key={card.id}
                src={
                  card.isNotZoombies ? card.image : cardImageUrl + '/' + card.id
                }
                alt={'CARD ' + card.id}
                loading="lazy"
              />
            ))
          ) : (
            <CircularProgress />
          )}
        </CardsContainer>
      </DetailCardsDiv>

      <Modal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      >
        <ModalContent>
          <div>Please wait for the Approval to complete.</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AuctionItem
