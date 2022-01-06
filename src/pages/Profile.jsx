import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DataGrid } from '@mui/x-data-grid'
import UserAllowance from '../components/UserAllowance'

import { useCheckIsItemSettledQuery, useFetchProfileQuery } from 'hooks/useProfile'
import { store } from 'store/store'

import { getCardSummary } from 'utils/cardsUtil'
import { getStatus } from 'utils/listingUtil'

import moment from 'moment'

import { zoomContractAddress, wmovrContractAddress, usdtContractAddress, QUERY_KEYS } from '../constants'

import { useHistory } from 'react-router'
import LoadingModal from 'components/LoadingModal'
import { Button, CircularProgress } from '@mui/material'
import { waitForTransaction } from 'utils/transactions'
import { useQueryClient } from 'react-query'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 12px;

  .user-profile-header {
    margin-top: 0;
    margin-bottom: 10px;
    color: white;
  }
`

const UserProfileWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  flex-direction: column;
  overflow-y: auto;

  .user-bid-wrapper,
  .user-listing-wrapper {
    width: 100%;
    border: 1px solid white;
    margin-bottom: 24px;
  }

  .div-allowance-accordion .MuiAccordion-region {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .data-grid-rows {
    cursor: pointer;
  }
`

const UserBidsWrapper = styled.div`
  .bid-empty,
  .listing-empty {
    width: 100%;
    text-align: center;
    padding: 12px;
  }

  .table {
    .MuiDataGrid-row {
      cursor: pointer;
    }

    .MuiDataGrid-footerContainer {
      justify-content: flex-end;

      .MuiDataGrid-selectedRowCount {
        display: none;
      }
    }
  }
`

const UserListingsWrapper = styled.div``

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

const StatusColumn = ({ auctionItem }) => {
  const [isSettling, setIsSettling] = useState(false)

  const {
    state: { wallet, contracts },
  } = useContext(store)
  const now = moment().unix()
  const end = moment(auctionItem.auctionEnd).unix()
  const isOver = end < now
  const isWinner = auctionItem.highestBidder === wallet.address
  const isOwner = wallet.address === auctionItem.seller
  const {
    isLoading: isCheckingSettled,
    data: isSettled
  } = useCheckIsItemSettledQuery(auctionItem.itemNumber, contracts.MarketContract)
  const canSettle = isOver && (isWinner || isOwner) && isSettled === false
  const queryClient = useQueryClient()

  if (isCheckingSettled) {
    return <CircularProgress size={20}></CircularProgress>
  }

  if (!isCheckingSettled && canSettle) {
    return (
      <Button
        style={{
          borderRadius: 10,
        }}
        variant="contained"
        color="success"
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
      >
        {isSettling ? (
          <CircularProgress size={20}></CircularProgress>
        ) : (
          'Settle'
        )}
      </Button>
    )
  }

  return (
    <Chip
      label={getStatus(auctionItem.auctionEnd, auctionItem.highestBidder).label}
      color={getStatus(auctionItem.auctionEnd, auctionItem.highestBidder).color}
    />
  )
}

const bidListingColumns = [
  {
    field: 'id',
    headerName: 'ID',
    valueGetter: (params) => '#' + params.id,
    hide: true,
  },
  {
    field: 'itemNumber',
    headerName: 'Item Number',
    valueGetter: (params) => '#' + params.value,
    width: 120,
  },
  {
    field: 'summary',
    headerName: 'Summary',
    minWidth: 200,
    flex: 2,
    valueGetter: (params) => getCardSummary(params.row.cards),
  },
  {
    field: 'userBid',
    headerName: 'Your Bid',
    sortable: false,
    minWidth: 130,
    flex: 1,
    valueGetter: (params) => {
      return `${params.value} ${params.row.currency}`
    },
  },
  {
    field: 'auctionEnd',
    headerName: 'End Time',
    valueFormatter: (params) => params.value === 0 ? 'Quick buy' : params.value.format('MM/DD/YYYY, h:mm:ss A'),
    minWidth: 230,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 160,
    renderCell: (params) => {
      return <StatusColumn auctionItem={params.row} />
    },
    // TODO: disable sorting for status column until figure out sortComparator
    // sortComparator:  (v1, v2, param1, param2) => {
    //   console.log()
    // }
    sortable: false,
  },
]

const userListingColumns = [
  {
    field: 'id',
    headerName: 'ID',
    valueGetter: (params) => '#' + params.id,
    hide: true,
  },

  {
    field: 'itemNumber',
    headerName: 'Item Number',
    valueGetter: (params) => '#' + params.value,
    width: 120,
  },
  {
    field: 'summary',
    headerName: 'Summary',
    minWidth: 200,
    flex: 2,
    valueGetter: (params) => getCardSummary(params.row.cards),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    sortable: false,
    minWidth: 130,
    flex: 1,
    valueGetter: (params) => {
      const value = Math.max(params.row.minPrice, params.row.highestBid)
      return `${value} ${params.row.currency}`
    },
  },
  {
    field: 'auctionEnd',
    headerName: 'End Time',
    valueFormatter: (params) => params.value === 0 ? 'Quick buy' : params.value.format('MM/DD/YYYY, h:mm:ss A'),
    minWidth: 230,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 160,
    renderCell: (params) => <StatusColumn auctionItem={params.row} />,
  },
]

const handleRowClick = (params, history) => {
  try {
    const itemNumber = parseInt(params.row.itemNumber)
    history.push(`/listing/${itemNumber}`)
  } catch (err) {
    console.error(`Failed to parse itemNumber: ${params.row.itemNumber}`)
  }
}

const UserBids = ({ bidCount, bids }) => {
  const history = useHistory()
  if (bidCount === 0) {
    return (
      <div className="bid-empty">
        <h1>You don't have any bids.</h1>
      </div>
    )
  } else {
    const formattedBids = bids.map((bid) => {
      const saleToken = bid.bidListing.saleToken
      let currency
      if (saleToken === zoomContractAddress) {
        currency = 'ZOOM'
      } else if (saleToken === wmovrContractAddress) {
        currency = 'MOVR'
      } else if (saleToken === usdtContractAddress) {
        currency = 'USDT'
      }

      return {
        auctionEnd: bid.bidListing.auctionEnd > 0 ? moment.unix(bid.bidListing.auctionEnd) : 0,
        highestBidder: bid.bidListing.highestBidder,
        highestBid: bid.bidListing.highestBid,
        minPrice: bid.bidListing.minPrice,
        currency: currency,
        id: bid._id,
        itemNumber: bid.bidListing.itemNumber,
        userBid: bid.bidAmount,
        cards: bid.bidListing.cards,
        seller: bid.bidListing.lister,
      }
    })

    return (
      <div className="user-bids">
        <DataGrid
          className="table"
          columns={bidListingColumns}
          rows={formattedBids}
          pageSize={20}
          rowsPerPageOptions={[10, 20, 50, 100]}
          autoHeight={true}
          onRowClick={(params) => {
            handleRowClick(params, history)
          }}
        ></DataGrid>
      </div>
    )
  }
}

const UserListings = ({ listingCount, listings }) => {
  const history = useHistory()
  if (listingCount === 0) {
    return (
      <div className="listing-empty">
        <h1>You don't have any listings.</h1>
      </div>
    )
  }

  const formattedListings = listings.map((listing) => {
    const saleToken = listing.saleToken
    let currency
    if (saleToken === zoomContractAddress) {
      currency = 'ZOOM'
    } else if (saleToken === wmovrContractAddress) {
      currency = 'MOVR'
    } else if (saleToken === usdtContractAddress) {
      currency = 'USDT'
    }

    return {
      auctionEnd: listing.auctionEnd > 0 ? moment.unix(listing.auctionEnd) : 0,
      highestBidder: listing.highestBidder,
      highestBid: listing.highestBid,
      minPrice: listing.minPrice,
      currency: currency,
      id: listing._id,
      itemNumber: listing.itemNumber,
      cards: listing.cards,
      seller: listing.lister,
    }
  })

  return (
    <div className="user-listings">
      <DataGrid
        className="table"
        columns={userListingColumns}
        rows={formattedListings}
        pageSize={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
        autoHeight={true}
        onRowClick={(params) => {
          handleRowClick(params, history)
        }}
        classes={{
          row: 'data-grid-rows',
        }}
      ></DataGrid>
    </div>
  )
}

const UserProfile = ({ data }) => {
  return (
    <UserProfileWrapper>
      <Accordion className={'div-allowance-accordion'}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h4">Set ZOOM Allowance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UserAllowance />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h4">Your Bids</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UserBidsWrapper className="user-bid-wrapper">
            <UserBids bidCount={data.bidCount} bids={data.bids}></UserBids>
          </UserBidsWrapper>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h4">Your Listings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UserListingsWrapper className="user-listing-wrapper">
            <UserListings
              listingCount={data.listingCount}
              listings={data.listings}
            ></UserListings>
          </UserListingsWrapper>
        </AccordionDetails>
      </Accordion>
    </UserProfileWrapper>
  )
}

const Profile = () => {
  const {
    state: { wallet },
  } = useContext(store)

  const { isLoading, data } = useFetchProfileQuery(wallet.address)

  return (
    <Container>
      <h1 className="user-profile-header">User Profile</h1>
      {isLoading || !wallet.address ? (
        <LoadingModal open={true} text="Loading Profile..." />
      ) : (
        data && <UserProfile data={data}></UserProfile>
      )}
    </Container>
  )
}

export default Profile
