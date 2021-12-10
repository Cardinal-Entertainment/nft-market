import React, { useContext, useState } from 'react'
import { useQueryClient } from 'react-query'
import styled from 'styled-components'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DataGrid } from '@mui/x-data-grid'

import {
  useFetchProfileQuery,
  useGetZoomAllowanceQuery,
} from 'hooks/useProfile'
import { store } from 'store/store'

import { getCardSummary } from 'utils/cardsUtil'
import { getStatus } from 'utils/listingUtil'

import moment from 'moment'

import {
  zoomContractAddress,
  wmovrContractAddress,
  marketContractAddress,
  QUERY_KEYS,
} from '../constants'

import { useHistory } from 'react-router'
import LoadingModal from 'components/LoadingModal'
import { Button, CircularProgress, Input } from '@mui/material'
import Slider from '@mui/material/Slider'
import { styled as muiStyled } from '@mui/material'

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

const UserAllowanceWrapper = muiStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  alignItems: 'center',
  maxWidth: '1024px',
  margin: '0 auto',

  '.slider-wrapper': {
    display: 'flex',
    alignItems: 'center',
    width: '50%',
    margin: '12px 0px',

    '.slider': {
      width: '80%',
      paddingRight: '24px',
    },
  },

  '.button-wrapper': {
    marginTop: '16px',
  },

  [theme.breakpoints.down('md')]: {
    '.slider-wrapper': {
      width: '80%',
      flexDirection: 'column',
    },
  },
}))

const UserListingsWrapper = styled.div``

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
    valueFormatter: (params) => params.value.format('MM/DD/YYYY, h:mm:ss A'),
    minWidth: 230,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 160,
    renderCell: (params) => (
      <Chip
        label={getStatus(params.row.auctionEnd, params.row.highestBidder).label}
        color={getStatus(params.row.auctionEnd, params.row.highestBidder).color}
      />
    ),
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
    valueFormatter: (params) => params.value.format('MM/DD/YYYY, h:mm:ss A'),
    minWidth: 230,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 160,
    renderCell: (params) => (
      <Chip
        label={getStatus(params.row.auctionEnd, params.row.highestBidder).label}
        color={getStatus(params.row.auctionEnd, params.row.highestBidder).color}
      />
    ),
  },
]

const handleRowClick = (params, history) => {
  try {
    const itemNumber = parseInt(params.row.itemNumber.replace('#', ''))
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
        currency = 'WMOVR'
      }

      return {
        auctionEnd: moment.unix(bid.bidListing.auctionEnd),
        highestBidder: bid.bidListing.highestBidder,
        highestBid: bid.bidListing.highestBid,
        minPrice: bid.bidListing.minPrice,
        currency: currency,
        id: bid._id,
        itemNumber: bid.bidListing.itemNumber,
        userBid: bid.bidAmount,
        cards: bid.bidListing.cards,
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
      currency = 'WMOVR'
    }

    return {
      auctionEnd: moment.unix(listing.auctionEnd),
      highestBidder: listing.highestBidder,
      highestBid: listing.highestBid,
      minPrice: listing.minPrice,
      currency: currency,
      id: listing._id,
      itemNumber: listing.itemNumber,
      cards: listing.cards,
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
      ></DataGrid>
    </div>
  )
}

const UserAllowance = ({ userAddress, zoomTokenContract }) => {
  const {
    state: { wallet, contracts },
  } = useContext(store)
  const { data: currentAllowance, isLoading } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract
  )
  const { zoomBalance } = wallet
  const [zoomAllowance, setZoomAllowance] = useState(0)
  const [isSettingAllowance, setIsSettingAllowance] = useState(false)

  const handleSliderChange = (event, newValue) => {
    setZoomAllowance(newValue)
  }

  const handleInputChange = (event) => {
    setZoomAllowance(
      event.target.value === '' ? '' : Number(event.target.value)
    )
  }

  const handleBlur = () => {
    if (zoomAllowance < 0) {
      setZoomAllowance(0)
    } else if (zoomAllowance > zoomBalance) {
      setZoomAllowance(zoomBalance)
    }
  }

  const queryClient = useQueryClient()

  const onSetZoomAllowance = async () => {
    try {
      setIsSettingAllowance(true)
      if (zoomAllowance < currentAllowance) {
        const tx = await contracts.ZoomContract.decreaseAllowance(
          marketContractAddress,
          currentAllowance - zoomAllowance
        )
        await tx.wait()
      } else if (zoomAllowance > currentAllowance) {
        const tx = await contracts.ZoomContract.increaseAllowance(
          marketContractAddress,
          zoomAllowance - currentAllowance
        )
        await tx.wait()
      }

      queryClient.setQueryData(
        [
          QUERY_KEYS.zoomAllowance,
          {
            userAddress: wallet.address,
            zoomTokenContract: contracts.ZoomContract.address,
          },
        ],
        zoomAllowance
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsSettingAllowance(false)
    }
  }

  return (
    <>
      <UserAllowanceWrapper>
        {isLoading ? (
          <CircularProgress></CircularProgress>
        ) : (
          <h2>Your current zoom allowance: {currentAllowance} ZOOM</h2>
        )}
        <div className="slider-wrapper">
          <div className="slider">
            <Slider
              value={zoomAllowance}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              min={0}
              max={zoomBalance ? parseInt(zoomBalance) : 0}
            />
          </div>
          <div>
            <Input
              value={zoomAllowance}
              size="large"
              fullWidth
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: 500,
                min: 0,
                max: parseInt(zoomBalance) || 0,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            ></Input>
          </div>
        </div>
        <div className="button-wrapper">
          <Button
            style={{
              minWidth: '150px',
            }}
            onClick={onSetZoomAllowance}
            disabled={isSettingAllowance}
            variant="contained"
          >
            {isSettingAllowance ? (
              <CircularProgress />
            ) : (
              `Set Zoom Allowance (${zoomAllowance} zoom)`
            )}
          </Button>
        </div>
      </UserAllowanceWrapper>
    </>
  )
}

const UserProfile = ({ data }) => {
  return (
    <UserProfileWrapper>
      <Accordion>
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
