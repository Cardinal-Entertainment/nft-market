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
  EVENT_TYPES,
  QUERY_KEYS,
  wmovrContractAddress,
  usdtContractAddress,
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
  zoomContractAddress
} from '../constants'
import { ethers } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import LazyLoad from 'react-lazyload'
import zoomLogo from '../assets/zoombies_coin.svg'
import movrLogo from '../assets/movr_logo.png'
import usdtLogo from '../assets/usdt.svg'
import LoadingModal from 'components/LoadingModal'
import { useQueryClient } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { useFetchSingleListingQuery } from 'hooks/useListing'
import { formatAddress } from 'utils/wallet'
import { styled } from '@mui/material'
import { toBigNumber } from '../utils/BigNumbers'
import { waitForTransaction } from 'utils/transactions'
import { useGetZoomAllowanceQuery } from 'hooks/useProfile'
import UserAllowance from '../components/UserAllowance'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import AccordionDetails from '@mui/material/AccordionDetails'

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
        justifyContent: 'center'
      }
    }
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

const handleSettle = async (history, marketContract, auctionId) => {
  const tx = await marketContract.settle(parseInt(auctionId))
  await waitForTransaction(tx)
  history.push('/')
}

const ListingNFTs = ({ cards }) => {
  const [enlargedCard, setEnlargedCard] = useState(cards[0])
  return (
    <ListingNFTWrapper>
      <div className="enlarged-nft">
        <LazyLoad once={true} resize={true}>
          <img
            src={`https://moonbase.zoombies.world/nft-image/${enlargedCard.id}`}
            alt={`Token #${enlargedCard.id}`}
            loading="lazy"
          />
        </LazyLoad>
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
                src={`https://moonbase.zoombies.world/nft-image/${card.id}`}
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
  isBidInProgress,
  handleConfirmBid,
  isAuctionOver,
  walletAddress,
  zoomAllowance,
}) => {
  const shortWallet = formatAddress(listing.seller)
  const dateListed = moment(listing.auctionStart * 1000).format(
    'MM/DD/YYYY h:mm:ss A'
  )
  const localAuctionEnd = moment(listing.auctionEnd * 1000).local()
  const auctionEndDate = localAuctionEnd.format('MMMM D, YYYY')
  const auctionEndTime = localAuctionEnd.format('h:mm:ss A')
  const timezone = momentTimezone.tz(momentTimezone.tz.guess()).zoneAbbr()
  const highestBid = toBigNumber(listing.highestBid)

  const auctionEndText = listing.auctionEnd === 0 ? "This auction will be ended immediately once someone places a bid." : `Auction ends ${auctionEndDate} at ${auctionEndTime} ${timezone}`;

  const [auctionCurrency, setAuctionCurrency] = useState('')

  const { state } = useContext(store);
  const { contracts } = state;

  useEffect(() => {
    console.log("listing.saleToken", listing.saleToken);
    const getTokenName = async ( saleToken ) => {
      if (saleToken === zoomContractAddress) {
        return await contracts.ZoomContract.name();
      } else if (saleToken === wmovrContractAddress) {
        return await contracts.WMOVRContract.name();
      } else if (saleToken === usdtContractAddress) {
        return await contracts.USDTContract.name();
      }
    };

    getTokenName(listing.saleToken).then( (name) => {
      setAuctionCurrency(name)
    })
  }, [contracts.ZoomContract, contracts.WMOVRContract, contracts.USDTContract, listing.saleToken]);

  /*
  const minOfferAmount =
    Math.max(parseFloat(listing.highestBid), parseFloat(listing.minPrice)) +
    minIncrement
*/
  let minOfferAmount = ethers.utils
    .parseEther(listing.highestBid.toString())
    .gt(ethers.utils.parseEther(listing.minPrice.toString()))
    ? ethers.utils.parseEther(listing.highestBid.toString())
    : ethers.utils.parseEther(listing.minPrice.toString())

  minOfferAmount = minOfferAmount.add(minIncrement)
  const isZoomAllowanceEnough = zoomAllowance
    ? minOfferAmount.lte(zoomAllowance)
    : false

  const maxOfferAmount =
    listing.currency === 'ZOOM'
      ? ethers.utils.parseEther(zoomBalance)
      : (
          listing.currency === 'USDT' ?
          ethers.utils.parseEther(usdtBalance.toString()) :
          ethers.utils.parseEther(movrBalance.toString())
        )

  const canBid =
    listing.currency === 'ZOOM'
      ? ethers.utils
          .parseEther(zoomBalance ? zoomBalance : '0')
          .gt(minOfferAmount)
      : (
        listing.currency === 'USDT' ?
          ethers.utils
            .parseEther(usdtBalance ? usdtBalance.toString() : '0')
            .gt(minOfferAmount) :
          ethers.utils
            .parseEther(movrBalance ? movrBalance.toString() : '0')
            .gt(minOfferAmount)
      )

  let offerToolTip;
  if (isAuctionOver) {
    offerToolTip = "This Auction is ended."
  }
  if (isBidInProgress) {
    offerToolTip = "Your bid is in processing."
  }
  if (listing.seller === walletAddress) {
    offerToolTip = "This is your auction."
  }
  if (listing.currency === 'ZOOM' && !isZoomAllowanceEnough) {
    offerToolTip = "You have not approved enough ZOOM, go to Profile page."
  }
  if (listing.currency === "ZOOM" && (zoomBalance ? ethers.utils.parseEther(zoomBalance).lt(minOfferAmount) : true)) {
    offerToolTip = "You do not have enough ZOOM tokens."
  }
  if (listing.currency === "MOVR" && (movrBalance ? ethers.utils.parseEther(movrBalance.toString()).lt(minOfferAmount) : true)) {
    offerToolTip = "You do not have enough MOVR."
  }
  if (listing.currency === "USDT" && (usdtBalance ? ethers.utils.parseEther(usdtBalance.toString()).lt(minOfferAmount) : true)) {
    offerToolTip = "You do not have enough USDT."
  }

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
        <h1>{listing.cards.length} Zoombies NFTs</h1>
      </div>
      <div className="auction-end">
        <h2>
          {auctionEndText}
        </h2>
      </div>
      <div className="price-wrapper">
        <div className={"currency-label"}>
          <p>
            Auction currency: {auctionCurrency}
          </p>
          <div className={"currency-logo"}>
            {listing.currency === 'ZOOM' ? (
              <StyledLogo src={zoomLogo} />
            ) : (
              listing.currency === 'USDT' ?
                <StyledLogo src={usdtLogo} /> :
                <StyledLogo src={movrLogo} />
            )}
          </div>
        </div>
        <p className="min-price">
          Minimum Bid:{' '}
          {ethers.utils.formatEther(
            ethers.utils.parseEther(listing.minPrice.toString())
          )}{' '}
          {listing.currency}
        </p>
        <p className="current-price">
          Current Bid: {ethers.utils.formatEther(highestBid)}{' '}
          {listing.currency}
        </p>
      </div>
      <div className="offer-wrapper">
        {!isZoomAllowanceEnough && listing.currency === 'ZOOM' && (
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
        {((!isAuctionOver && listing.auctionEnd > 0) ||
          (listing.auctionEnd === 0 && !listing.isItemSettled)) && (
          <OfferDialog
            minAmount={minOfferAmount}
            currency={listing.currency}
            maxAmount={maxOfferAmount}
            onConfirm={handleConfirmBid}
            minIncrement={ethers.utils.formatEther(minIncrement)}
            disabled={
              isBidInProgress ||
              !canBid ||
              ((isAuctionOver && listing.auctionEnd > 0) || (listing.isItemSettled && listing.auctionEnd === 0)) ||
              listing.seller === walletAddress ||
              (!isZoomAllowanceEnough && listing.currency === 'ZOOM')
            }
            tooltip={offerToolTip}
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
                    <TableCell>
                      {ethers.utils.formatEther(
                        ethers.utils.parseEther(bid.bidAmount.toString())
                      )}
                    </TableCell>
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
  const { id } = useParams()
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [bidInProgress, setBidInProgress] = useState(false)

  const auctionId = parseInt(id)

  const {
    state: { contracts, wallet, zoomIncrement, wmovrIncrement, usdtIncrement },
  } = useContext(store)

  const { zoomBalance, wmovrBalance, balance: movrBalance, usdtBalance } = wallet
  const { MarketContract } = contracts

  const queryClient = useQueryClient()
  useEffect(() => {
    const token = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
      const bid = data
      const currentListing = queryClient.getQueryData([
        QUERY_KEYS.listing,
        {
          itemNumber: auctionId,
          marketContractAddress: MarketContract?.address,
        },
      ])
      const randomId = uuidv4()
      const bidWithId = {
        ...bid,
        _id: randomId,
      }

      if (bid.itemNumber === auctionId) {
        if (currentListing && currentListing.bids) {
          if (currentListing.bids.length > 0) {
            queryClient.setQueryData(
              [
                QUERY_KEYS.listing,
                {
                  itemNumber: auctionId,
                  marketContractAddress: MarketContract?.address,
                },
              ],
              {
                ...currentListing,
                bids: [...currentListing.bids, bidWithId],
                highestBid: bid.bidAmount,
              }
            )
          }
        } else {
          queryClient.setQueryData(
            [
              QUERY_KEYS.listing,
              {
                itemNumber: auctionId,
                marketContractAddress: MarketContract?.address,
              },
            ],
            {
              ...currentListing,
              bids: [bidWithId],
              highestBid: bid.bidAmount,
            }
          )
        }
      }
    })

    return () => PubSub.unsubscribe(token)
  }, [queryClient, auctionId, MarketContract])

  const { isLoading: isFetchingListing, data: auctionItem } =
    useFetchSingleListingQuery(auctionId, MarketContract)

  const { data: currentZoomAllowance } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract
  )

  if (isFetchingListing) {
    return (
      <LoadingModal text="Loading auction item..." open={isFetchingListing} />
    )
  }

  if (auctionItem) {
    const now = moment().unix()
    const end = moment(auctionItem.auctionEnd * 1000).unix()
    const isOver = end < now
    const isWinner = auctionItem.highestBidder === wallet.address
    const isOwner = wallet.address === auctionItem.seller
    const canSettle =
      isOver && (isWinner || isOwner) && !auctionItem.isItemSettled
    const sellerURL =
      wallet.chainId === 1287
        ? `${ZoombiesTestingEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`
        : `${ZoombiesStableEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`

    const minIncrement =
      auctionItem.currency === 'ZOOM' ? zoomIncrement : (auctionItem.currency === 'USDT' ? usdtIncrement : wmovrIncrement)

    const handleConfirmBid = async (amount) => {
      try {
        setBidInProgress(true)
        const { currency, id } = auctionItem

        const minAmount = ethers.utils
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

        if (ethers.utils.parseEther(amount.toString()).lt(minAmount)) {
          throw new Error(`Invalid amount valid : ${amount}`)
        }

        const bidTx = await contracts.MarketContract.bid(
          parseInt(id),
          toBigNumber(amount),
          { value: currency === 'MOVR' ? toBigNumber(amount) : 0 }
        )
        await waitForTransaction(bidTx)
      } catch (e) {
        console.error("Failed to bid: ", e);
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
              color="success"
              onClick={() => handleSettle(history, MarketContract, auctionId)}
            >
              Settle
            </Button>
          )}
        </HeaderRow>
        <div className="listing-content">
          <div className="listing-wrapper">
            <ListingNFTs cards={auctionItem.cards} />
            <ListingMetadata
              minIncrement={minIncrement}
              zoomBalance={zoomBalance}
              wmovrBalance={wmovrBalance}
              usdtBalance={usdtBalance}
              movrBalance={movrBalance}
              isBidInProgress={bidInProgress}
              listing={auctionItem}
              sellerUrl={sellerURL}
              handleConfirmBid={handleConfirmBid}
              isAuctionOver={isOver}
              walletAddress={wallet.address}
              zoomAllowance={currentZoomAllowance}
            />
          </div>

          <ItemHistory bids={auctionItem.bids} />
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
