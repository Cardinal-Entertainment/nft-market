import React, { useContext, useEffect, useState } from "react";
import { store } from "store/store";
import styled from "styled-components/macro";
import { getAuctionListings } from "utils/auction";
import { DataGrid } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import moment from "moment";
import { useHistory } from "react-router-dom";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

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
  const {
    state: { wallet, contracts },
  } = useContext(store);

  const getStatus = (endTime, highestBidder) => {
    console.log({ highestBidder });
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
    { field: "id", headerName: "ID", width: 50 },
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

    return Object.keys(countByRarity)
      .map((rarity) => `${countByRarity[rarity]} ${rarity}`)
      .join(", ");
  };

  const handleRowClick = (row) => {
    history.push(`/listing/${row.id}`);
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
        onRowClick={handleRowClick}
      />
    </Container>
  );
};

export default Home;
