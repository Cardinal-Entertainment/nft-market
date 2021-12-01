import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import styled from 'styled-components';
import Filterbar from '../components/Filterbar';
import InfiniteScroll from 'react-infinite-scroller';
import AuctionItem from '../components/AuctionItem';
import { useFetchListingQuery } from '../hooks/useListing';
import LoadingModal from 'components/LoadingModal';
import { EVENT_TYPES, QUERY_KEYS } from '../constants';
import { useQueryClient } from 'react-query';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = PubSub.subscribe(EVENT_TYPES.ItemListed, (msg, data) => {
      /**
       * We will only append the new listing based on the current cached data a user is viewing.
       * Say a user clears the filter afterwards,
       * react-query will automatically refetch since we are using filters as part of query key.
       *
       * The assumption is that by the time user switches filter, the new listing should've been
       * stored in the database and API call will fetch it.
       * So it should be safe to have the data eventually consistent.
       */
      const currentData = queryClient.getQueryData([
        QUERY_KEYS.listings,
        { filters },
      ]);
      if (currentData) {
        queryClient.setQueryData(
          [QUERY_KEYS.listings, { filters }],
          (queryData) => {
            return {
              pageParams: queryData.pageParams,
              pages: [
                {
                  totalCount: queryData.pages[0].totalCount + 1,
                  nextOffset: queryData.pages[0].nextOffset,
                  data: [data],
                },
                ...queryData.pages,
              ],
            };
          }
        );
      }
    });

    return () => PubSub.unsubscribe(token);
  }, [queryClient, filters]);

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
                <AuctionItem
                  content={auction}
                  key={`${auction.itemNumber}-${auction._id}`}
                />
              ))
            )}
          </InfiniteScroll>
        )}
      </div>
    </Container>
  );
};

export default Home;
