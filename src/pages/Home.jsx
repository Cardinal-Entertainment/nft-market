import React, { useContext, useState } from 'react';
import { store } from 'store/store';
import styled from 'styled-components';
import Filterbar from '../components/Filterbar';
import InfiniteScroll from 'react-infinite-scroller';
import AuctionItem from '../components/AuctionItem';
import { useFetchListingQuery } from '../hooks/useListing';
import LoadingModal from 'components/LoadingModal';

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

const Home = () => {
  const [filters, setFilters] = useState({
    cardType: '', // 'Shop' or 'Booster'
    rarity: '', // 'epic', 'rare', 'uncommon', 'common'
    token: '', // the token's contract address
    keyword: '', // search keyword,
    sortField: '', //sort by key
  });
  
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useFetchListingQuery(filters);

  const handleFilterChanged = async (params) => {
    setFilters({ ...filters, ...params });
  };

  const totalCount =
    data && data.pages.length > 0 ? data.pages[0].totalCount : 0;

  return (
    <Container>
      <Filterbar
        onFilterChanged={handleFilterChanged}
        filters={filters}
        totalCount={totalCount}
      />
      <div
        style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      >
        {isLoading ? (
          <LoadingModal
            text="Loading Live Auctions..."
            open={isLoading}
          ></LoadingModal>
        ) : (
          <InfiniteScroll
            hasMore={hasNextPage}
            loadMore={fetchNextPage}
            useWindow={false}
          >
            {data.pages.map((page) =>
              page.data.map((auction) => (
                <AuctionItem content={auction} key={auction._id} />
              ))
            )}
          </InfiniteScroll>
        )}
      </div>
    </Container>
  );
};

export default Home;
