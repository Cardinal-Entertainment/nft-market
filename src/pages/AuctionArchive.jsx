import React from 'react';
import styled from 'styled-components';
import flatten from 'lodash/flatten';

import LoadingModal from 'components/LoadingModal';
import { LISTING_PARAMS, useFetchListingQuery } from 'hooks/useListing';
import InfiniteScroll from 'react-infinite-scroller';
import AuctionItem from 'components/AuctionItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;

  .auction-archives-header {
    margin-top: 0;
    margin-bottom: 10px;
    color: white;
  }
`;

const AuctionArchive = () => {
  const { data, isLoading, hasNextPage, fetchNextPage } = useFetchListingQuery({
    status: LISTING_PARAMS.status.ended,
  });

  const totalCount = data?.pages[0]?.totalCount || 0;

  const auctionItems = data
    ? flatten(data.pages.map((page) => page.data))
    : null;

  return (
    <Container>
      <h1 className="auction-archives-header">
        Auction Archives
        {totalCount && ` - ${totalCount} Past Auctions`}
      </h1>
      {isLoading ? (
        <LoadingModal open={true} text="Loading Profile..." />
      ) : (
        <InfiniteScroll
          hasMore={hasNextPage}
          loadMore={fetchNextPage}
          useWindow={false}
        >
          {auctionItems.map((auction) => (
            <AuctionItem content={auction} key={auction._id} />
          ))}
        </InfiniteScroll>
      )}
    </Container>
  );
};

export default AuctionArchive;
