import React, { useContext, useEffect, useState } from 'react'
import PubSub from 'pubsub-js'
import Button from '@mui/material/Button'
import { store } from 'store/store'
import { useHistory, useParams } from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { CircularProgress, Modal, Paper } from '@mui/material'
import OfferDialog from 'components/OfferDialog'
import {
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
  NETWORKS,
  NFT_CONTRACTS,
  CURRENCY_ICONS,
  CURRENCY_TYPES,
} from '../constants'
import { ethers } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import LazyLoad from 'react-lazyload'
import LoadingModal from 'components/LoadingModal'
import { useQueryClient } from 'react-query'
import { useFetchSingleListingQuery } from 'hooks/useListing'
import { formatAddress } from 'utils/wallet'
import { styled } from '@mui/material'
import { waitForTransaction } from 'utils/transactions'
import {
  getUserTokenAllowance,
  useGetZoomAllowanceQuery,
} from 'hooks/useProfile'
import UserAllowance from '../components/UserAllowance'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import AccordionDetails from '@mui/material/AccordionDetails'
import { newBidEventForListing } from 'utils/events'
import {
  approveTokenContractAmount,
  getTokenContract,
  getTokenMinIncrement,
  getTokenNameFromAddress,
  getWalletBalance,
  isWalletBalanceEnough,
  parseAmountToBigNumber,
} from 'utils/currencies'

const Container = styled('div')(({ theme }) => ({
  backgroundColor: 'white',
  width: '100%',
  padding: '16px 24px',
  display: 'flex',
  flexDirection: 'column',
  marginRight: '12px',

  [theme.breakpoints.down('md')]: {
    padding: '0',
  },

  h1: {
    color: 'gray',
  },

  '.listing-content': {
    display: 'flex',
    flex: 1,
    overflowY: 'auto',
    flexDirection: 'column',
    maxWidth: '1920px',
    width: '100%',
    padding: '0 20px',

    [theme.breakpoints.down('md')]: {
      padding: '0',
    },

    '.listing-wrapper': {
      display: 'flex',
      flexWrap: 'wrap',
      [theme.breakpoints.down('md')]: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  },
}))

const FlexRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
})

const HeaderRow = styled(FlexRow)(({ theme }) => ({
  width: '100%',
  justifyContent: 'space-between',

  '& svg': {
    cursor: 'pointer',
  },

  '& h1': {
    marginLeft: '10px',
  },

  '.title-back-btn': {
    display: 'flex',
    alignItems: 'center',
  },
}))

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

const StyledLogo = styled('img')({
  width: '30px',
  padding: '0 5px',
})

const ListingNFTWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '20%',
  minWidth: '177px',

  '& img': {
    width: '100%',
  },

  '& .nft-previews': {
    display: 'flex',
    overflowX: 'auto',

    '& button': {
      background: 'none',
      marginRight: '16px',
      border: 'none',
    },

    '& img': {
      width: '50px',
    },
  },

  '& .enlarged-nft': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
})

const ListingMetadataWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '48px',

  [theme.breakpoints.down('md')]: {
    padding: '0',
    alignItems: 'center',
    justifyContent: 'center',

    '& .seller-date-wrapper': {
      alignItems: 'center',
      justifyContent: 'center',
    },

    '& .auction-end h2': {
      textAlign: 'center',
    },
  },

  '& .seller-date-wrapper': {
    display: 'flex',
    flexWrap: 'wrap',
  },

  '& .nft-count': {
    marginTop: '24px',

    '& h1': {
      color: 'black',
    },
  },

  '& .auction-end': {
    marginTop: '12px',

    '& h2': {
      color: 'gray',
      fontWeight: 'normal',
      margin: '0',
    },
  },

  '& .price-wrapper': {
    marginTop: '24px',

    '& p': {
      fontSize: '1.5rem',
      margin: 0,
    },

    '& .min-price': {
      color: '#2169a9',
      display: 'flex',
      alignItems: 'center',
    },

    '& .current-price': {
      color: '#357439',
    },

    '& .currency-label': {
      display: 'flex',

      '& .currency-logo': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  },

  '& .offer-wrapper': {
    marginTop: '32px',

    '.not-enough-zoom-msg': {
      color: '#ffa726',
    },
  },

  '& .offer-wrapper .zoom-allowance-accordion': {
    marginBottom: '12px',
  },

  '& span': {
    fontSize: '1.25rem',
    marginRight: '24px',

    '& a': {
      marginLeft: '8px !important',
    },
  },
}))

const ItemHistoryWrapper = styled('div')(({ theme }) => ({
  marginTop: '32px',
  padding: '16px 16px 0px 0px',
  alignItems: 'center',
  justifyContent: 'center',

  [theme.breakpoints.down('md')]: {
    padding: '4px',
  },

  '& h2': {
    fontWeight: 'normal',
  },

  '& h3': {
    color: 'gray',
  },

  ' & .bid-table': {
    border: '1px solid black',
  },

  '& .bid-table-header th': {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },

  '& .highest-bid': {
    background: '#238636',
  },

  '& .highest-bid td': {
    color: 'white',
  },
}))

const handleSettle = async (history, marketContract, auctionId, network) => {
  const tx = await marketContract.settle(parseInt(auctionId))
  await waitForTransaction(tx)
  history.push(`/${network}`)
}

const ListingNFTs = ({ cards, network }) => {
  const [enlargedCard, setEnlargedCard] = useState(cards[0])
  const imageUrl = NETWORKS[network].imageUrl

  return (
    <ListingNFTWrapper>
      <div className="enlarged-nft">
        <LazyLoad once={true} resize={true}>
          <img
            src={
              enlargedCard.isNotZoombies
                ? enlargedCard.image
                : `${imageUrl}/${enlargedCard.id}`
            }
            alt={`Token #${enlargedCard.id}`}
            loading="lazy"
          />
        </LazyLoad>
        ID: {enlargedCard.id}
      </div>
      <div className="nft-previews">
        {cards.map((card) => (
          <LazyLoad key={card.id} once={true} resize={true}>
            <button
              style={
                enlargedCard.id === card.id
                  ? {
                      backgroundColor: 'lightgray',
                    }
                  : {}
              }
              disabled={enlargedCard.id === card.id}
              onClick={() => setEnlargedCard(card)}
            >
              <img
                src={card.isNotZoombies ? card.image : `${imageUrl}/${card.id}`}
                alt={`Token #${card.id}`}
                loading="lazy"
              />
            </button>
          </LazyLoad>
        ))}
      </div>
    </ListingNFTWrapper>
  )
}

const ListingMetadata = ({
  listing,
  sellerUrl,
  minIncrement,
  zoomBalance,
  movrBalance,
  usdtBalance,
  daiBalance,
  isBidInProgress,
  handleConfirmBid,
  isAuctionOver,
  walletAddress,
  zoomAllowance,
  networkName,
}) => {
  const {
    seller,
    minPrice,
    auctionStart,
    auctionEnd,
    bids,
    isItemSettled,
    highestBid,
    saleToken,
    numBids,
  } = listing
  const shortWallet = formatAddress(seller)
  const dateListed = moment(auctionStart * 1000).format('MM/DD/YYYY h:mm:ss A')
  const localAuctionEnd = moment(auctionEnd * 1000).local()
  const auctionEndDate = localAuctionEnd.format('MMMM D, YYYY')
  const auctionEndTime = localAuctionEnd.format('h:mm:ss A')
  const timezone = momentTimezone.tz(momentTimezone.tz.guess()).zoneAbbr()

  const {
    state: { wallet },
  } = useContext(store)

  const auctionEndText =
    auctionEnd === 0 //instantBid
      ? bids.length > 0 || isItemSettled //Auction achive view
        ? 'This auction has CLOSED'
        : 'This auction will end immediately once someone places a bid.'
      : Date.now() >= localAuctionEnd //Auction achive view
      ? `Auction CLOSED: ${auctionEndDate} at ${auctionEndTime} ${timezone}`
      : `Auction ends: ${auctionEndDate} at ${auctionEndTime} ${timezone}`

  const [auctionCurrency, setAuctionCurrency] = useState('')

  useEffect(() => {
    if (saleToken) {
      const tokenName = getTokenNameFromAddress(saleToken, networkName)
      setAuctionCurrency(tokenName)
    }
  }, [saleToken, networkName])

  /*
  const minOfferAmount =
    Math.max(parseFloat(listing.highestBid), parseFloat(listing.minPrice)) +
    minIncrement
*/
  const parsedMinIncrement = parseAmountToBigNumber(
    minIncrement.toString(),
    saleToken,
    networkName
  )
  const parsedHighestBid = parseAmountToBigNumber(
    highestBid.toString(),
    saleToken,
    networkName
  )
  const parsedMinPrice = parseAmountToBigNumber(
    minPrice,
    saleToken,
    networkName
  )

  const minOfferAmount =
    numBids > 0
      ? parsedHighestBid.add(parsedMinIncrement)
      : parsedMinPrice.add(parsedMinIncrement)

  const isZoomAllowanceEnough = zoomAllowance
    ? minOfferAmount.lte(zoomAllowance)
    : false

  const maxOfferAmount = wallet ? getWalletBalance(wallet, auctionCurrency) : 0

  const canBid = isWalletBalanceEnough(auctionCurrency, wallet, minOfferAmount)

  // TODO(mchi): clean this up
  let offerToolTip
  if (isAuctionOver) {
    offerToolTip = 'This Auction is ended.'
  }
  if (isBidInProgress) {
    offerToolTip = 'Your bid is in processing.'
  }
  if (listing.seller === walletAddress) {
    offerToolTip = 'This is your auction.'
  }
  if (listing.currency === 'ZOOM' && !isZoomAllowanceEnough) {
    offerToolTip = 'You have not approved enough ZOOM, go to Profile page.'
  }
  if (
    listing.currency === 'ZOOM' &&
    (zoomBalance
      ? ethers.utils.parseEther(zoomBalance).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough ZOOM tokens.'
  }
  if (
    listing.currency === 'MOVR' &&
    (movrBalance
      ? ethers.utils.parseEther(movrBalance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough MOVR.'
  }
  if (
    listing.currency === 'USDT' &&
    (usdtBalance
      ? ethers.utils.parseEther(usdtBalance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough USDT.'
  }
  if (
    listing.currency === 'DAI' &&
    (daiBalance
      ? ethers.utils.parseEther(daiBalance.toString()).lt(minOfferAmount)
      : true)
  ) {
    offerToolTip = 'You do not have enough DAI.'
  }

  const contract = NFT_CONTRACTS[networkName].find((e) => {
    return e.address === listing.nftToken
  })

  return (
    <ListingMetadataWrapper>
      <div className="seller-date-wrapper">
        <span>
          Seller Wallet:
          <a href={sellerUrl} rel="noreferrer" target="_blank">
            {shortWallet}
          </a>
        </span>
        <span>Date Listed: {dateListed}</span>
      </div>
      <div className="nft-count">
        <h1>
          {listing.cards.length} {contract.name ? contract.name : 'Unknown'}{' '}
          NFTs
        </h1>
      </div>
      <div className="auction-end">
        <h2>{auctionEndText}</h2>
      </div>
      <div className="price-wrapper">
        <div className={'currency-label'}>
          <p>Auction currency: {auctionCurrency}</p>
          <div className={'currency-logo'}>
            <StyledLogo src={CURRENCY_ICONS[listing.currency]} />
          </div>
        </div>
        <p className="min-price">
          Opening Bid: {minPrice.toString()} {listing.currency}
        </p>
        <p className="current-price">
          Current Bid: {highestBid} {listing.currency}
        </p>
      </div>
      <div className="offer-wrapper">
        {!isZoomAllowanceEnough && listing.currency === CURRENCY_TYPES.ZOOM && (
          <>
            <p className="not-enough-zoom-msg">
              Not enough Zoom set in allowance!
            </p>
            <Accordion className={'zoom-allowance-accordion'}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h8">Increase ZOOM Allowance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <UserAllowance initial={minOfferAmount} />
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {((!isAuctionOver && auctionEnd > 0) ||
          (auctionEnd === 0 && !isItemSettled)) && (
          <OfferDialog
            minAmount={minOfferAmount}
            currency={listing.currency}
            maxAmount={maxOfferAmount}
            onConfirm={handleConfirmBid}
            minIncrement={minIncrement}
            disabled={
              isBidInProgress ||
              !canBid ||
              (isAuctionOver && listing.auctionEnd > 0) ||
              (listing.isItemSettled && listing.auctionEnd === 0) ||
              listing.seller === walletAddress ||
              (!isZoomAllowanceEnough &&
                listing.currency === CURRENCY_TYPES.ZOOM)
            }
            tooltip={offerToolTip}
            timestamp={auctionEnd}
            saleToken={saleToken}
            network={networkName}
          />
        )}
      </div>
    </ListingMetadataWrapper>
  )
}

const ItemHistory = ({ bids }) => {
  const reversed = [...bids]
  reversed.reverse()
  return (
    <ItemHistoryWrapper>
      <h2>Item History</h2>
      {bids.length === 0 ? (
        <h3>There are currently no bids for this auction.</h3>
      ) : (
        <TableContainer
          classes={{
            root: 'bid-table',
          }}
          component={Paper}
        >
          <Table stickyHeader={true} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow
                classes={{
                  head: 'bid-table-header',
                }}
              >
                <TableCell>Event</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids &&
                reversed.map((bid, index) => (
                  <TableRow
                    key={bid._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    className={index === 0 ? 'highest-bid' : ''}
                  >
                    <TableCell>Bid</TableCell>
                    <TableCell>
                      {moment(bid.timestamp * 1000).format(
                        'MM/DD/YYYY, h:mm:ss A'
                      )}
                    </TableCell>
                    <TableCell>
                      {bid.bidder
                        ? `${bid.bidder.substr(0, 8)} ... ${bid.bidder.substr(
                            36
                          )}`
                        : ''}
                    </TableCell>
                    <TableCell>{bid.bidAmount.toString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </ItemHistoryWrapper>
  )
}

const ViewListing = () => {
  const history = useHistory()
  const { id, network } = useParams()
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [bidInProgress, setBidInProgress] = useState(false)

  const auctionId = parseInt(id)

  const { state } = useContext(store)

  const { contracts, wallet } = state

  const { zoomBalance, balance: movrBalance, usdtBalance, daiBalance } = wallet
  const { MarketContract, ReadOnlyMarketContract } = contracts
  const { chainId, marketContractAddress: marketAddress } = NETWORKS[network]

  const queryClient = useQueryClient()
  useEffect(() => {
    const token = newBidEventForListing(
      queryClient,
      auctionId,
      ReadOnlyMarketContract,
      chainId
    )

    return () => PubSub.unsubscribe(token)
  }, [queryClient, auctionId, ReadOnlyMarketContract, chainId])

  const { isLoading: isFetchingListing, data: auctionItem } =
    useFetchSingleListingQuery(auctionId, ReadOnlyMarketContract, chainId)

  const { data: currentZoomAllowance } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract,
    network
  )

  if (isFetchingListing) {
    return (
      <LoadingModal text="Loading auction item..." open={isFetchingListing} />
    )
  }

  if (auctionItem) {
    const {
      saleToken,
      auctionEnd,
      highestBidder,
      seller,
      isItemSettled,
      cards,
      bids,
      highestBid,
      minPrice,
      numBids,
      currency,
      itemNumber,
    } = auctionItem
    const now = moment().unix()
    const end = moment(auctionEnd * 1000).unix()
    const isOver = end < now
    const isWinner = highestBidder === wallet.address
    const isOwner = wallet.address === seller
    const canSettle = isOver && (isWinner || isOwner) && !isItemSettled
    const isInstantAuction = auctionEnd === 0

    const sellerURL =
      chainId === 1287
        ? `${ZoombiesTestingEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`
        : `${ZoombiesStableEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`

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
    const minOfferAmount =
      numBids > 0
        ? parsedHighestBid.add(parsedMinIncrement)
        : parsedMinPrice.add(parsedMinIncrement)

    const handleConfirmBid = async (amount) => {
      try {
        setBidInProgress(true)
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
            value:
              currency === CURRENCY_TYPES.MOVR ? parsedAmount.toString() : 0,
          }
        )
        await waitForTransaction(bidTx)
      } catch (e) {
        console.error('Failed to bid: ', e)
      } finally {
        setBidInProgress(false)
      }
    }

    return (
      <Container>
        <HeaderRow>
          <div className="title-back-btn">
            <FontAwesomeIcon
              icon={faChevronLeft}
              size="2x"
              onClick={() => history.goBack()}
              color="gray"
            />
            <h1>Auction #{auctionId}</h1>
          </div>

          {canSettle && (
            <Button
              variant="contained"
              color={isInstantAuction ? 'warning' : 'success'}
              onClick={() =>
                handleSettle(history, MarketContract, auctionId, network)
              }
            >
              {isInstantAuction ? 'Cancel' : 'Settle'}
            </Button>
          )}
        </HeaderRow>
        <div className="listing-content">
          <div className="listing-wrapper">
            <ListingNFTs cards={cards} network={network} />
            <ListingMetadata
              minIncrement={minIncrement}
              zoomBalance={zoomBalance}
              usdtBalance={usdtBalance}
              movrBalance={movrBalance}
              daiBalance={daiBalance}
              isBidInProgress={bidInProgress}
              listing={auctionItem}
              sellerUrl={sellerURL}
              handleConfirmBid={handleConfirmBid}
              isAuctionOver={isOver}
              walletAddress={wallet.address}
              zoomAllowance={currentZoomAllowance}
              networkName={network}
            />
          </div>

          <ItemHistory bids={bids} />
        </div>
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

  return null
}

export default ViewListing
