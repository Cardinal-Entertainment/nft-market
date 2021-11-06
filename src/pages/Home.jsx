import React, { useContext, useEffect, useState} from "react";
import { store } from "store/store";
import styled from "styled-components";
import {getAuctionListingsFromChain, getAuctionListingsFromServer} from "utils/auction";
import { DataGrid } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import moment from "moment";
import {useHistory} from "react-router-dom";
import Filterbar from "../components/Filterbar";
import AuctionItem from "../components/AuctionItem";
import AuctionsListView from "../components/AuctionsListView";

const Container = styled.div`
  flex: auto;
  display: flex;
  flex-direction: column;
  //overflow-y: auto;
  border: solid 1px white;
  padding: 16px;
  
  .live-header {
    color: white;
    font-weight: 500;
    font-size: 32px;
    line-height: 47px;
    
    span {
      font-weight: 300;
    }
  }
  
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
    cardType: '', // 'shop' or 'booster'
    rarity: '', // 'epic', 'rare', 'uncommon', 'common'
    token: '', // 'wmovr', 'zoom'
    keyword: '' // search keyword
  });
  const [sortBy, setSortBy] = useState({
    field: '', //attribute name of an auction
    order: 1 // 1 : ascending, -1 : descending
  })


  const {
    state: { wallet, contracts },
  } = useContext(store);

  const getStatus = (endTime, highestBidder) => {
    // console.log({ highestBidder });
    const now = moment().unix();
    const end = moment(endTime).unix();

    if (end < now) {
      if (highestBidder === wallet.address) {
        return {
          label: "You Won!",
          color: "success",
        };
      }
      return {
        label: "Completed",
        color: "success",
      };
    }
    if (end - now < 86400) {
      return {
        label: "Ending Soon",
        color: "warning",
      };
    }
    return {
      label: "Ongoing",
      color: "secondary",
    };
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      valueGetter: (params) =>
      '#'+ params.id  },
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
          params.getValue(params.id, "highestBid")
        );
        return `${value} ${params.getValue(params.id, "currency")}`;
      },
    },
    {
      field: "auctionEnd",
      headerName: "End Time",
      valueFormatter: (params) => params.value.format("MM/DD/YYYY, h:mm:ss A"),
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
              params.getValue(params.id, "auctionEnd"),
              params.getValue(params.id, "highestBidder")
            ).label
          }
          color={
            getStatus(
              params.getValue(params.id, "auctionEnd"),
              params.getValue(params.id, "highestBidder")
            ).color
          }
        />
      ),
    },
  ];

  const loadListings = async () => {
    // const auctionListings = await getAuctionListingsFromChain(
    //   contracts.MarketContract,
    //   contracts.ZoombiesContract
    // );

    const auctionListings = await getAuctionListingsFromServer(filters)
    setListings(auctionListings);
  };

  const getCardSummary = (cards) => {
    const countByRarity = cards.reduce((summary, card) => {
      const { rarityValue } = card;
      if (!summary.hasOwnProperty(rarityValue)) {
        summary[rarityValue] = 0;
      }
      summary[rarityValue]++;
      return summary;
    }, {});

    return Object.keys(countByRarity)
      .map((rarity) => `${countByRarity[rarity]} ${rarity}`)
      .join(", ") + ' (' + cards.map((card) => card.name).join(',') + ')';
  };

  const handleRowClick = (row) => {
    history.push(`/listing/${row.id}`);
  };

  const handleFilterChanged = (params) => {
    setFilters({ ...filters, ...params })
  }

  const handleSortByChanged = (attribute) => {
    setSortBy({ ...sortBy, ...attribute })
  }

  const filterCondition = (auction) => {

    // return auction.currency.toLowerCase().includes(filters.token)
    //     && auction.cards.filter(card => card.rarityValue.includes(filters.rarity)).length > 0
    //     && auction.cards.filter(card => card.in_store.toLowerCase().includes(filters.cardType)).length > 0
    //     && ( auction.cards.filter(card => card.name.toLowerCase().includes(filters.keyword.toLowerCase())).length > 0
    //       || auction.cards.filter(card => card.card_set.toLowerCase().includes(filters.keyword.toLowerCase())).length > 0 )

    return true

  }

  const compareFunc = (a, b) => {
    let res = 0
    if (sortBy.field === 'auctionEnd') { //case of datetime
      res = moment(a[sortBy.field]).isAfter(b[sortBy.field]) ? 1 : (moment(a[sortBy.field]).isSame(b[sortBy.field]) ? 0 : -1)
    } else { // min_price and highest_bid

      if (sortBy.field === '') {
        return 1
      }

      if (a.currency === 'WMOVR' && b.currency === 'ZOOM') {
        res = 1
      } else if (a.currency === 'ZOOM' && b.currency === 'WMOVR') {
        res = -1
      } else {
        res = parseFloat(a[sortBy.field]) > parseFloat(b[sortBy.field]) ? 1 : (parseFloat(a[sortBy.field]) ===  parseFloat(b[sortBy.field]) ? 0 : -1)
      }
    }

    return res * sortBy.order
  }

  useEffect(() => {
    if (contracts.MarketContract) {
      loadListings();
    }
  }, [contracts.MarketContract, filters]);

  return (
    <Container>
      <div className={'live-header'}>
        Live Now - <span>{listings.length + " items"}</span>
      </div>
      <Filterbar onFilterChanged={handleFilterChanged} filters={filters} onSortByChanged={handleSortByChanged} sortBy={sortBy}/>
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
    </Container>
  );
};

export default Home;
