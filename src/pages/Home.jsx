import React, { useContext, useEffect, useState } from "react";
import { store } from "store/store";
import styled from "styled-components/macro";
import { getAuctionListings } from "utils/auction";
import { DataGrid } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import moment from "moment";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .table {
    background: white;
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
  const [listings, setListings] = useState([]);
  const {
    state: { contracts },
  } = useContext(store);

  const getStatus = (endTime) => {
    const now = moment().unix();
    const end = moment(endTime).unix();

    if (end < now) {
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
      color: "primary",
    };
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "summary",
      headerName: "Summary",
      minWidth: 150,
      flex: 2,
      valueGetter: (params) =>
        getCardSummary(params.getValue(params.id, "cards")),
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
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
      valueFormatter: (params) => params.value.format("MM/DD/YYYY, HH:mm:ss A"),
      minWidth: 230,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 160,
      renderCell: (params) => (
        <Chip
          label={getStatus(params.getValue(params.id, "auctionEnd")).label}
          color={getStatus(params.getValue(params.id, "auctionEnd")).color}
        />
      ),
    },
  ];

  const loadListings = async () => {
    const auctionListings = await getAuctionListings(
      contracts.MarketContract,
      contracts.ZoombiesContract
    );
    setListings(auctionListings);
    console.log({ auctionListings });
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

    const strSummary = Object.keys(countByRarity)
      .map((rarity) => `${countByRarity[rarity]} ${rarity}`)
      .join(", ");

    return strSummary;
  };

  useEffect(() => {
    if (contracts.MarketContract) {
      loadListings();
    }
  }, [contracts.MarketContract]);

  return (
    <Container>
      <DataGrid
        className="table"
        rows={listings}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
      {/* {listings.map((listing) => (
        <Listing>
          <div>Auction #{listing.auctionId}</div>
          <div>{getCardSummary(listing.cards)}</div>
        </Listing>
      ))} */}
    </Container>
  );
};

export default Home;
