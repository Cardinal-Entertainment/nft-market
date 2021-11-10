import React, { useContext } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';

import { useFetchProfileQuery } from 'hooks/useProfile';
import { store } from 'store/store';

import { getCardSummary } from 'utils/cardsUtil';
import { getStatus } from 'utils/listingUtil';

import moment from 'moment';

import { zoomContractAddress, wmovrContractAddress } from '../constants';

import { useHistory } from 'react-router';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .user-profile-header {
    margin-top: 0;
    margin-bottom: 10px;
    color: white;
  }
`;

const ProfileLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50% auto;
`;

// const BidListings = styled.div`

// `
const UserProfileWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  flex-direction: column;

  .user-bid-wrapper,
  .user-listing-wrapper {
    width: 100%;
    border: 1px solid white;
    margin-bottom: 24px;
  }
`;

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
`;

const UserListingsWrapper = styled.div``;

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
    valueGetter: (params) =>
      getCardSummary(params.getValue(params.id, 'cards')),
  },
  {
    field: 'userBid',
    headerName: 'Your Bid',
    sortable: false,
    minWidth: 130,
    flex: 1,
    valueGetter: (params) => {
      return `${params.value} ${params.getValue(params.id, 'currency')}`;
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
        label={
          getStatus(
            params.getValue(params.id, 'auctionEnd'),
            params.getValue(params.id, 'highestBidder')
          ).label
        }
        color={
          getStatus(
            params.getValue(params.id, 'auctionEnd'),
            params.getValue(params.id, 'highestBidder')
          ).color
        }
      />
    ),
  },
];

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
    valueGetter: (params) =>
      getCardSummary(params.getValue(params.id, 'cards')),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    sortable: false,
    minWidth: 130,
    flex: 1,
    valueGetter: (params) => {
      const value = Math.max(
        params.getValue(params.id, 'minPrice'),
        params.getValue(params.id, 'highestBid')
      );
      return `${value} ${params.getValue(params.id, 'currency')}`;
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
        label={
          getStatus(
            params.getValue(params.id, 'auctionEnd'),
            params.getValue(params.id, 'highestBidder')
          ).label
        }
        color={
          getStatus(
            params.getValue(params.id, 'auctionEnd'),
            params.getValue(params.id, 'highestBidder')
          ).color
        }
      />
    ),
  },
];

const handleRowClick = (params, history) => {
  try {
    const itemNumber = parseInt(params.getValue(params.id, 'itemNumber').replace('#', ''));
    history.push(`/listing/${itemNumber}`); 
  } catch (err) {
    console.error(`Failed to parse itemNumber: ${params.getValue(params.id, 'itemNumber')}`)
  }
  
};

const UserBids = ({ bidCount, bids }) => {
  const history = useHistory();
  if (bidCount === 0) {
    return (
      <div className="bid-empty">
        <h1>You don't have any bids.</h1>
      </div>
    );
  } else {
    const formattedBids = bids.map((bid) => {
      const saleToken = bid.bidListing.saleToken;
      let currency;
      if (saleToken === zoomContractAddress) {
        currency = 'ZOOM';
      } else if (saleToken === wmovrContractAddress) {
        currency = 'WMOVR';
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
        cards: bid.bidListing.cards
      };
    });

    return (
      <div className="user-bids">
        <DataGrid
          className="table"
          columns={bidListingColumns}
          rows={formattedBids}
          pageSize={20}
          rowsPerPageOptions={[10, 20, 50, 100]}
          autoHeight={true}
          onRowClick={(params, event, details) => {
            handleRowClick(params, history)
          }}
        ></DataGrid>
      </div>
    );
  }
};

const UserListings = ({ listingCount, listings }) => {
  const history = useHistory();
  if (listingCount === 0) {
    return (
      <div className="listing-empty">
        <h1>You don't have any listings.</h1>
      </div>
    );
  }

  const formattedListings = listings.map((listing) => {
    const saleToken = listing.saleToken;
    let currency;
    if (saleToken === zoomContractAddress) {
      currency = 'ZOOM';
    } else if (saleToken === wmovrContractAddress) {
      currency = 'WMOVR';
    }

    return {
      auctionEnd: moment.unix(listing.auctionEnd),
      highestBidder: listing.highestBidder,
      highestBid: listing.highestBid,
      minPrice: listing.minPrice,
      currency: currency,
      id: listing._id,
      itemNumber: listing.itemNumber,
      cards: listing.cards
    };
  });

  return (
    <div className="user-listings">
      <DataGrid
        className="table"
        columns={userListingColumns}
        rows={formattedListings}
        pageSize={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
        autoHeight={true}
        onRowClick={(params, event, details) => {
          handleRowClick(params, history)
        }}
      ></DataGrid>
    </div>
  );
};

const UserProfile = ({ data }) => {
  return (
    <UserProfileWrapper>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h4">Auction Bids</Typography>
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
  );
};

const Profile = () => {
  const {
    state: { wallet },
  } = useContext(store);

  const { isLoading, data } = useFetchProfileQuery(wallet.address);

  return (
    <Container>
      <h1 className="user-profile-header">User Profile</h1>
      {isLoading || !wallet.address ? (
        <ProfileLoadingState>
          <CircularProgress style={{ color: 'white' }} size={80} />
        </ProfileLoadingState>
      ) : (
        data && <UserProfile data={data}></UserProfile>
      )}
    </Container>
  );
};

export default Profile;
