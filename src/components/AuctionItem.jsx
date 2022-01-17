import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import movrLogo from '../assets/movr_logo.png'
import usdtLogo from '../assets/usdt.svg'
import daiLogo from '../assets/dai.png'
import zoomCoin from '../assets/zoombies_coin.svg'
import { Button, CircularProgress, Modal, styled, Grid } from '@mui/material'
import {
  cardImageBaseURL,
  QUERY_KEYS,
  wmovrContractAddress,
  usdtContractAddress,
  daiContractAddress,
  zoomContractAddress, marketContractAddress, zoombiesContractAddress
} from '../constants'
import { useTheme } from 'styled-components'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { store } from '../store/store'
import { ethers } from 'ethers'
import OfferDialog from './OfferDialog'
import { useFetchBids } from 'hooks/useBids'
import { toBigNumber } from '../utils/BigNumbers'
import { waitForTransaction } from 'utils/transactions'
import {
  getUserTokenAllowance,
  useCheckIsItemSettledQuery,
  useGetZoomAllowanceQuery
} from 'hooks/useProfile'
import { useQueryClient } from 'react-query'
import { getTokenSymbol } from '../utils/auction'

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
  // height: '296px',

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
    paddingRight: '4px'
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
  objectFit: 'contain'
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
        : (timestamp > 0 ? moment.unix(timestamp).format('MM/DD/YYYY, h:mm:ss A') : 'Quick buy' )}
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
      [QUERY_KEYS.isSettled, { itemNumber: auctionId, marketContract: marketContract.address }],
      true
    )
  } catch (err) {
    console.error(err)
    setIsSettling(false)
  }
}

const AuctionItem = ({ content, archived }) => {
  const {
    state: { contracts, wallet, zoomIncrement, wmovrIncrement, usdtIncrement, daiIncrement },
  } = useContext(store)
  const history = useHistory()
  const [bidInProgress, setBidInProgress] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [isSettling, setIsSettling] = useState(false)

  const theme = useTheme()

  const auctionItem = content
  const { itemNumber } = auctionItem

  const coinType = getTokenSymbol(auctionItem.saleToken)

  const getTokenMinIncrement = (saleToken) => {
    if (saleToken === zoomContractAddress) {
      return zoomIncrement
    } else if (saleToken === wmovrContractAddress) {
      return wmovrIncrement
    } else if (saleToken === usdtContractAddress) {
      return usdtIncrement
    } else if (saleToken === daiContractAddress) {
      return daiIncrement
    } else {
      return 0
    }
  }

  const minIncrement = getTokenMinIncrement(auctionItem.saleToken)

  const { data } = useFetchBids(itemNumber)
  const minOfferAmount = ethers.utils
    .parseEther(auctionItem?.highestBid.toString())
    .add(minIncrement)
    .gt(
      ethers.utils
        .parseEther(auctionItem?.minPrice.toString())
        .add(minIncrement)
    )
    ? ethers.utils
        .parseEther(auctionItem?.highestBid.toString())
        .add(minIncrement)
    : ethers.utils
        .parseEther(auctionItem?.minPrice.toString())
        .add(minIncrement)

  const handleConfirmBid = async (amount) => {
    try {
      setBidInProgress(true)
      const { itemNumber } = auctionItem
      let { currency } = auctionItem

      if (currency === undefined) {
        currency = getTokenSymbol(auctionItem.saleToken)
      }

      if (ethers.utils.parseEther(amount.toString()).lt(minOfferAmount)) {
        throw new Error(`Invalid amount valid : ${amount}`)
      }

      const weiAmount = ethers.utils.parseEther(amount.toString())

      if (currency !== 'ZOOM' && currency !== 'MOVR') {
        let tokenContract
        if (auctionItem.saleToken === daiContractAddress) {
          tokenContract = contracts.DAIContract
        } else if (auctionItem.saleToken === usdtContractAddress) {
          tokenContract = contracts.USDTContract
        }
        const allowance = await getUserTokenAllowance(tokenContract, wallet.address)
        if (allowance.lt(weiAmount)) {
          if (auctionItem.saleToken === daiContractAddress) {
            const approveTx = await contracts.DAIContract.approve(marketContractAddress, weiAmount)
            await waitForTransaction(approveTx)
          } else if (auctionItem.saleToken === usdtContractAddress) {
            const approveTx = await contracts.USDTContract.approve(marketContractAddress, weiAmount)
            await waitForTransaction(approveTx)
          }
        }
      }

      const bidTx = await contracts.MarketContract.bid(
        parseInt(itemNumber),
        weiAmount,
        { value: currency === 'MOVR' ? weiAmount : 0 }
      )
      await waitForTransaction(bidTx)
    } catch (e) {
      console.error(e)
    } finally {
      setBidInProgress(false)
    }
  }

  const gotoAuction = () => {
    history.push(`/listing/${auctionItem.itemNumber}`)
  }

  const { data: zoomAllowance } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract
  )

  const isAllowanceEnough = zoomAllowance
    ? zoomAllowance.gte(minOfferAmount)
    : false

  let offerToolTip
  if (moment().isAfter(moment.unix(auctionItem.auctionEnd))) {
    offerToolTip = 'This Auction is ended.'
  }
  if (bidInProgress) {
    offerToolTip = 'Your bid is in processing.'
  }
  if (auctionItem.lister === wallet.address) {
    offerToolTip = 'This is your auction.'
  }
  if (coinType === 'ZOOM' && !isAllowanceEnough) {
    offerToolTip = 'You have not approved enough ZOOM, go to Profile page'
  }
  if (
    coinType === 'ZOOM' &&
    (wallet.zoomBalance
      ? ethers.utils.parseEther(wallet.zoomBalance).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough ZOOM tokens'
  }
  if (
    coinType === 'MOVR' &&
    (wallet.balance
      ? ethers.utils.parseEther(wallet.balance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough MOVR'
  }

  if (
    coinType === 'USDT' &&
    (wallet.usdtBalance
      ? ethers.utils.parseEther(wallet.usdtBalance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough USDT'
  }

  if (
    coinType === 'DAI' &&
    (wallet.daiBalance
      ? ethers.utils.parseEther(wallet.daiBalance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough DAI'
  }

  const now = moment().unix()
  const end = auctionItem.auctionEnd
  const isOver = end < now
  const isWinner = auctionItem.highestBidder === wallet.address
  const isOwner = wallet.address === auctionItem.lister
  const { isLoading: isCheckingSettled, data: isSettled } =
    useCheckIsItemSettledQuery(itemNumber, contracts.MarketContract)

  const canSettle = isOver && (isWinner || isOwner) && isSettled === false

  const queryClient = useQueryClient()

  return (
    <Container key={auctionItem._id} container>
      <MetaDiv>
        <MetaHeader>
          <div className={'meta-header-left'}>
            <div className={'meta-header-title'} onClick={gotoAuction}>
              Auction #{itemNumber}
            </div>
            {/*{favorite ? (*/}
            {/*  <FontAwesomeIcon*/}
            {/*    icon={faHeartSolid}*/}
            {/*    color={'rgba(255, 0, 0, 0.87)'}*/}
            {/*    size="lg"*/}
            {/*    onClick={toggleFavorite}*/}
            {/*  />*/}
            {/*) : (*/}
            {/*  <FontAwesomeIcon*/}
            {/*    icon={faHeart}*/}
            {/*    color={'rgba(0, 0, 0, 0.87)'}*/}
            {/*    size="lg"*/}
            {/*    onClick={toggleFavorite}*/}
            {/*  />*/}
            {/*)}*/}
          </div>
          <div className={'meta-header-right'}>
            <div className={'meta-header-cards-tip'}>
              {
                auctionItem.saleToken !== zoombiesContractAddress ? '' : (
                  <>
                    <span style={{ color: theme.colors.epic }}>
                    {
                      auctionItem.cards.filter((card) => {
                        return card.rarity.toLowerCase() === 'epic'
                      }).length
                    }
                      E
                    </span>
                        <span style={{ color: theme.colors.rare }}>
                      {
                        auctionItem.cards.filter((card) => {
                          return card.rarity.toLowerCase() === 'rare'
                        }).length
                      }
                          R
                    </span>
                        <span style={{ color: theme.colors.uncommon }}>
                      {
                        auctionItem.cards.filter((card) => {
                          return card.rarity.toLowerCase() === 'uncommon'
                        }).length
                      }
                          U
                    </span>
                        <span style={{ color: theme.colors.common }}>
                      {
                        auctionItem.cards.filter((card) => {
                          return card.rarity.toLowerCase() === 'common'
                        }).length
                      }
                          C
                    </span>
                  </>
                )
              }

            </div>
            <div className={'meta-header-bids'}>
              {data?.length > 0 ? data.length : 'No'} bids
            </div>
          </div>
        </MetaHeader>
        <MetaContent>
          <MetaContentRow>
            <MetaContentBidAmount>
              <img
                className={'meta-content-coin-icon'}
                src={coinType === 'ZOOM' ? zoomCoin : ( coinType === 'USDT' ? usdtLogo : (coinType === 'DAI' ? daiLogo : movrLogo))}
                alt={coinType}
                loading="lazy"
              />
              <span>
                {ethers.utils.formatEther(
                  ethers.utils.parseEther(auctionItem.highestBid.toString())
                )}
              </span>
              <span className={'meta-content-coin-text'}>{coinType}</span>
            </MetaContentBidAmount>
            <MetaContentTip>Highest Bid</MetaContentTip>
          </MetaContentRow>
          <MetaContentRow>
            <MetaContentTime>
              <FontAwesomeIcon icon={faClock} size="lg" />
              <DownCounter timestamp={auctionItem.auctionEnd} />
            </MetaContentTime>
            <MetaContentTip>Remaining time</MetaContentTip>
          </MetaContentRow>
          <MetaContentButtonSection>
            {(!archived || (archived && (auctionItem.auctionEnd === 0 && !isSettled))) && (
              <OfferDialog
                currency={coinType}
                minAmount={minOfferAmount}
                maxAmount={
                  coinType === 'ZOOM'
                    ? wallet.zoomBalance
                      ? ethers.utils.parseEther(wallet.zoomBalance)
                      : toBigNumber(0)
                    : (
                        coinType === 'USDT' ?
                        wallet.usdtBalance ? toBigNumber(wallet.usdtBalance): toBigNumber(0) :
                          (
                            coinType === 'DAI' ?
                              wallet.daiBalance ? toBigNumber(wallet.daiBalance): toBigNumber(0) :
                              wallet.balance ? toBigNumber(wallet.balance) : toBigNumber(0)
                          )
                    )
                }
                onConfirm={handleConfirmBid}
                disabled={
                  ((moment().isAfter(moment.unix(auctionItem.auctionEnd)) && auctionItem.auctionEnd > 0) || (auctionItem.auctionEnd === 0 && isSettled) ) ||
                  bidInProgress ||
                  auctionItem.lister === wallet.address ||
                  (coinType === 'ZOOM' && !isAllowanceEnough) ||
                  (coinType === 'MOVR' &&
                    (wallet.balance
                      ? ethers.utils
                          .parseEther(wallet.balance.toString())
                          .lt(minOfferAmount)
                      : true)) ||
                  (coinType === 'USDT' &&
                    (wallet.usdtBalance
                      ? ethers.utils
                        .parseEther(wallet.usdtBalance.toString())
                        .lt(minOfferAmount)
                      : true)) ||
                  (coinType === 'DAI' &&
                    (wallet.daiBalance
                      ? ethers.utils
                        .parseEther(wallet.daiBalance.toString())
                        .lt(minOfferAmount)
                      : true)) ||
                  (coinType === 'ZOOM' &&
                    (wallet.zoomBalance
                      ? ethers.utils
                          .parseEther(wallet.zoomBalance)
                          .lt(minOfferAmount)
                      : true))
                }
                tooltip={offerToolTip}
                mylisting={auctionItem.lister === wallet.address}
                minIncrement={ethers.utils.formatEther(minIncrement)}
                quickBid
                timestamp={auctionItem.timestamp}
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
                      auctionItem.itemNumber,
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
          {auctionItem?.cards ? (
            auctionItem.cards.map((card) => (
              <CardImage
                key={card.id}
                src={card.isNotZoombies ? card.image : cardImageBaseURL + '/' + card.id}
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
