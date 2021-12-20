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
  marketContractAddress,
  QUERY_KEYS,
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
} from '../constants'
import { ethers } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import LazyLoad from 'react-lazyload'
import zoomLogo from '../assets/zoombies_coin.svg'
import movrLogo from '../assets/movr_logo.png'
import LoadingModal from 'components/LoadingModal'
import { useQueryClient } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { useFetchSingleListingQuery } from 'hooks/useListing'
import { formatAddress } from 'utils/wallet'
import { styled } from '@mui/material';
import { compareAsBigNumbers, toBigNumber } from '../utils/BigNumbers'

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
        justifyContent: 'center'
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
    }
  }
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
    }
  },

  '& .seller-date-wrapper': {
    display: 'flex',
    flexWrap: 'wrap',
  },

  '& .nft-count': {
    marginTop: '24px',

    '& h1': {
      color: 'black',
    }
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
    }
  },

  '& .offer-wrapper': {
    marginTop: '32px',
  },

  '& span': {
    fontSize: '1.25rem',
    marginRight: '24px',

    '& a': {
      marginLeft: '8px !important'
    }
  }
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
  }
}))


const handleSettle = async (history, marketContract, auctionId) => {
  const tx = await marketContract.settle(parseInt(auctionId))
  await tx.wait()
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
  wmovrBalance,
  movrBalance,
  isBidInProgress,
  handleConfirmBid,
  isAuctionOver,
  walletAddress
}) => {
  const shortWallet = formatAddress(listing.seller)
  const dateListed = moment(listing.auctionStart * 1000).format(
    'MM/DD/YYYY h:mm:ss A'
  )
  const localAuctionEnd = moment(listing.auctionEnd * 1000).local()
  const auctionEndDate = localAuctionEnd.format('MMMM D, YYYY')
  const auctionEndTime = localAuctionEnd.format('h:mm:ss A')
  const timezone = momentTimezone.tz(momentTimezone.tz.guess()).zoneAbbr()
  const highestBid =
    compareAsBigNumbers(listing.highestBid, listing.minPrice) === 1
      ? toBigNumber(listing.highestBid) : toBigNumber(listing.minPrice)

/*
  const minOfferAmount =
    Math.max(parseFloat(listing.highestBid), parseFloat(listing.minPrice)) +
    minIncrement
*/
  let minOfferAmount =
      ethers.utils.parseEther(listing.highestBid.toString()).gt(ethers.utils.parseEther(listing.minPrice.toString()))
      ? ethers.utils.parseEther(listing.highestBid.toString())
      : ethers.utils.parseEther(listing.minPrice.toString());

      console.log("minOfferAmount before", minOfferAmount, minOfferAmount.toString(), minIncrement);
      minOfferAmount = minOfferAmount.add(minIncrement);
      console.log("minOfferAmount after", minOfferAmount.toString());


  const maxOfferAmount =
    listing.currency === 'ZOOM' ? ethers.utils.parseEther(zoomBalance) : ethers.utils.parseEther(wmovrBalance).add(ethers.utils.parseEther(movrBalance.toString()))

  console.log("maxOfferAmount", ethers.utils.formatEther(maxOfferAmount));
  const canBid =
    listing.currency === 'ZOOM'
      ? ethers.utils.parseEther(zoomBalance ? zoomBalance : "0").gt(minOfferAmount)
      : ethers.utils.parseEther(wmovrBalance ? wmovrBalance : "0").gt(minOfferAmount)

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
          Auction ends {auctionEndDate} at {auctionEndTime} {timezone}
        </h2>
      </div>
      <div className="price-wrapper">
        <p className="min-price">
          Minimum Price: {ethers.utils.formatEther(ethers.utils.parseEther(listing.minPrice.toString()))} {listing.currency}
          {listing.currency === 'ZOOM' ? (
            <StyledLogo src={zoomLogo} />
          ) : (
            <StyledLogo src={movrLogo} />
          )}
        </p>
        <p className="current-price">
          Current Price: {ethers.utils.formatEther(highestBid)} {listing.currency}
        </p>
      </div>
      <div className="offer-wrapper">
        {
          !isAuctionOver && (
            <OfferDialog
              minAmount={minOfferAmount}
              currency={listing.currency}
              maxAmount={maxOfferAmount}
              onConfirm={handleConfirmBid}
              disabled={isBidInProgress || !canBid || isAuctionOver || listing.seller === walletAddress}
            />
          )
        }
      </div>
    </ListingMetadataWrapper>
  )
}

const ItemHistory = ({ bids }) => {
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
                bids.map((bid) => (
                  <TableRow
                    key={bid._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                    <TableCell>{ethers.utils.formatEther(ethers.utils.parseEther(bid.bidAmount.toString()))}</TableCell>
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
    state: { contracts, wallet, zoomIncrement, wmovrIncrement },
  } = useContext(store)

  const { zoomBalance, wmovrBalance, balance: movrBalance } = wallet
  const { MarketContract } = contracts

  const queryClient = useQueryClient()
  useEffect(() => {
    const token = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
      const bid = data
      const currentListing = queryClient.getQueryData([
        QUERY_KEYS.listing,
        { itemNumber: auctionId, marketContractAddress: MarketContract?.address },
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
              [QUERY_KEYS.listing,  { itemNumber: auctionId, marketContractAddress: MarketContract?.address }],
              {
                ...currentListing,
                bids: [...currentListing.bids, bidWithId],
                highestBid: bid.bidAmount
              }
            )
          }
        } else {
          queryClient.setQueryData(
            [QUERY_KEYS.listing,  { itemNumber: auctionId, marketContractAddress: MarketContract?.address }],
            {
              ...currentListing,
              bids: [bidWithId],
              highestBid: bid.bidAmount
            }
          )
        }
      }
    })

    return () => PubSub.unsubscribe(token)
  }, [queryClient, auctionId, MarketContract])

  const { isLoading: isFetchingListing, data: auctionItem } =
    useFetchSingleListingQuery(auctionId, MarketContract)

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
      auctionItem.currency === 'ZOOM' ? zoomIncrement : wmovrIncrement

    const handleConfirmBid = async (amount) => {
      const { currency, id } = auctionItem
      let currencyContract

      const minAmount = ethers.utils.parseEther(auctionItem?.highestBid.toString()).add(minIncrement)
        .gt(ethers.utils.parseEther(auctionItem?.minPrice.toString()).add(minIncrement)) ?
        ethers.utils.parseEther(auctionItem?.highestBid.toString()).add(minIncrement) :
        ethers.utils.parseEther(auctionItem?.minPrice.toString()).add(minIncrement)
      
      console.log("Pre:", amount);
      if (ethers.utils.parseEther(amount.toString()).lt(minAmount)) {
        throw new Error(`Invalid amount valid : ${amount}`)
      }

      switch (currency) {
        case 'ZOOM':
          currencyContract = contracts.ZoomContract
          break
        case 'WMOVR':
          currencyContract = contracts.WMOVRContract
          break
        default:
          throw new Error(`Unhandled currency type: ${currency}`)
      }

      if (currency === "ZOOM") {
        const approveTx = await currencyContract.approve(
          marketContractAddress,
          toBigNumber(amount)
        )
        setApprovalModalOpen(true)
        await approveTx.wait()
        setApprovalModalOpen(false)
      }

      setBidInProgress(true)
      const bidTx = await contracts.MarketContract.bid(parseInt(id), toBigNumber(amount))
      await bidTx.wait()
      setBidInProgress(false)
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
              movrBalance={movrBalance}
              isBidInProgress={bidInProgress}
              listing={auctionItem}
              sellerUrl={sellerURL}
              handleConfirmBid={handleConfirmBid}
              isAuctionOver={isOver}
              walletAddress={wallet.address}
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
