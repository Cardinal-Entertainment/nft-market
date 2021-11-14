import React, {useContext, useEffect, useRef, useState} from "react";
import { store } from "store/store";
import styled from "styled-components";
import Chip from "@mui/material/Chip";
import moment from "moment";
import {useHistory} from "react-router-dom";
import Filterbar from "../components/Filterbar";
import { getCardSummary } from "utils/cardsUtil";
import { getStatus } from "utils/listingUtil";
import {marketContractAddress, zoombiesContractAddress} from "../constants";
import InfiniteScroll from "react-infinite-scroller";
import {CircularProgress, Modal} from "@mui/material";
import AuctionItem from "../components/AuctionItem";
import {useFetchListingQuery} from "../hooks/useListing";

const Container = styled.div`
  flex: auto;
  display: flex;
  flex-direction: column;
  //overflow-y: auto;
  border: solid 1px white;
  padding: 16px;
  overflow-y: auto;
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

const Home = () => {
  const history = useHistory()
  const [listings, setListings] = useState([])
  const [filters, setFilters] = useState({
    cardType: '', // 'Shop' or 'Booster'
    rarity: '', // 'epic', 'rare', 'uncommon', 'common'
    token: '', // the token's contract address
    keyword: '', // search keyword,
    sortField: '' //sort by key
  });
  const [sortBy, setSortBy] = useState({
    field: '', //attribute name of an auction
    order: 1 // 1 : ascending, -1 : descending
  })
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const {
    state: { contracts },
  } = useContext(store);

  const loadingCallback = ( totalCount ) => {
    setLoading(false)
    setTotalCount(totalCount)
  }

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    remove
  } = useFetchListingQuery(filters, loadingCallback)

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

  const handleFilterChanged = async (params) => {
    setLoading(true)
    setFilters({ ...filters, ...params })
    remove()
  }

  const handleSortByChanged = (attribute) => {
    // setSortBy({ ...sortBy, ...attribute })
    setLoading(true)
    setFilters({ ...filters, ...{
      sortField: attribute.field
    }})
    remove()
  }

  useEffect(() => {
    if (contracts.MarketContract) {
      // loadListings();
    }
  }, [contracts.MarketContract, filters, sortBy]);

  return (
    <Container>
      <Filterbar onFilterChanged={handleFilterChanged} filters={filters} onSortByChanged={handleSortByChanged} sortBy={sortBy} totalCount={totalCount}/>
      {/*<DataGrid*/}
      {/*    className="table"*/}
      {/*    rows={listings.filter(auction => filterCondition(auction)).sort(compareFunc)}*/}
      {/*    columns={columns}*/}
      {/*    pageSize={20}*/}
      {/*    rowsPerPageOptions={[10, 20, 50, 100]}*/}
      {/*    onRowClick={handleRowClick}*/}
      {/*    autoHeight={true}*/}
      {/*/>*/}
      {/*{*/}

      <div style={{display: 'flex', flexDirection:'column', overflowY: 'auto'}}>
        {!isLoading && (
            <InfiniteScroll hasMore={hasNextPage} loadMore={fetchNextPage} useWindow={false}>
              {data.pages.map((page, index) =>
                page.data.map(auction =>
                <AuctionItem content={auction} key={auction._id}/>
                )
              )}
            </InfiniteScroll>
        )}


      <Modal
        open={loading}
      >
        <ModalContent>
          <div>Loading Auctions...</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
      </div>
    </Container>
  );
};

export default Home;
