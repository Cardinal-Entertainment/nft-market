import React, { useContext, useEffect, useState} from "react";
import { store } from "store/store";
import styled from "styled-components";
import {getAuctionListings} from "utils/auction";
import Chip from "@mui/material/Chip";
import moment from "moment";
import {useHistory} from "react-router-dom";
import Filterbar from "../components/Filterbar";
import AuctionsListView from "../components/AuctionsListView";
import {CircularProgress, Modal} from "@mui/material";
import { getCardSummary } from "utils/cardsUtil";
import { getStatus } from "utils/listingUtil";


const Container = styled.div`
  flex: auto;
  display: flex;
  flex-direction: column;
  //overflow-y: auto;
  border: solid 1px white;
  padding: 16px;
  overflow-y: auto;
  background: white;
  border-radius: 5px;

  .table {
    background: white;

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

const ModalContent = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  & > * {
    margin: 5px 0;
  }
`;

const Listing = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 5px 10px;
  margin: 5px 0;
  border-radius: 8px;
`;

const Home = () => {
  const history = useHistory();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    cardType: '', // 'Shop' or 'Booster'
    rarity: '', // 'epic', 'rare', 'uncommon', 'common'
    token: '', // the token's contract address
    keyword: '' // search keyword
  });
  const [sortBy, setSortBy] = useState({
    field: '', //attribute name of an auction
    order: 1 // 1 : ascending, -1 : descending
  })
  const [loading, setLoading] = useState(false);


  const {
    state: { contracts },
  } = useContext(store);


  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      valueGetter: (params) =>
      '#'+ params.getValue(params.id, "itemNumber")  },
    {
      field: "summary",
      headerName: "Summary",
      minWidth: 200,
      flex: 2,
      valueGetter: (params) =>
        getCardSummary(params.getValue(params.id, "cards")),
    },
    {
      field: "amount",
      headerName: "Amount",
      sortable: false,
      minWidth: 130,
      flex: 1,
      valueGetter: (params) => {
        const value = Math.max(
          params.getValue(params.id, "minPrice"),
          params.getValue(params.id, "highestBid"),
        );
        return `${value} ${params.getValue(params.id, "currency")}`;
      },
    },
    {
      field: "auctionEnd",
      headerName: "End Time",
      valueFormatter: (params) => {
        const date = moment(params.value * 1000)
        return date.format("MM/DD/YYYY, h:mm:ss A")
      },
      minWidth: 230,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 160,
      renderCell: (params) => (
        <Chip
          label={
            getStatus(
              params.getValue(params.id, "auctionEnd") * 1000,
              params.getValue(params.id, "highestBidder")
            ).label
          }
          color={
            getStatus(
              params.getValue(params.id, "auctionEnd") * 1000,
              params.getValue(params.id, "highestBidder")
            ).color
          }
        />
      ),
    },
  ];

  const loadListings = async () => {

    setLoading(true)
    const auctionListings = await getAuctionListings(
      contracts.MarketContract,
      contracts.ZoombiesContract,
      filters,
      sortBy
    );
    setListings(auctionListings.map((listing) => ({
      ...listing,
      id: listing._id
    })));
    setLoading(false)
  };



  const handleRowClick = ({row}) => {
    history.push(`/listing/${row.itemNumber}`);
  };

  const handleFilterChanged = (params) => {
    setFilters({ ...filters, ...params })
  }

  const handleSortByChanged = (attribute) => {
    setSortBy({ ...sortBy, ...attribute })
  }

  useEffect(() => {
    if (contracts.MarketContract) {
      loadListings();
    }
  }, [contracts.MarketContract, filters, sortBy]);

  return (
    <Container>
      <Filterbar onFilterChanged={handleFilterChanged} filters={filters} onSortByChanged={handleSortByChanged} sortBy={sortBy} totalCount={listings.length}/>
      {/*<DataGrid*/}
      {/*    className="table"*/}
      {/*    rows={listings.filter(auction => filterCondition(auction)).sort(compareFunc)}*/}
      {/*    columns={columns}*/}
      {/*    pageSize={20}*/}
      {/*    rowsPerPageOptions={[10, 20, 50, 100]}*/}
      {/*    onRowClick={handleRowClick}*/}
      {/*    autoHeight={true}*/}
      {/*/>*/}
      <AuctionsListView auctions={listings}/>
      <Modal
        open={loading}
      >
        <ModalContent>
          <div>Loading Auctions...</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Home;
