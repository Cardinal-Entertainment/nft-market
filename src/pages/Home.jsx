import React, { useContext, useEffect, useState } from 'react'
import PubSub from 'pubsub-js'
import styled from 'styled-components'
import Filterbar from '../components/Filterbar'
import InfiniteScroll from 'react-infinite-scroller'
import AuctionItem from '../components/AuctionItem'
import { useFetchListingQuery } from '../hooks/useListing'
import LoadingModal from 'components/LoadingModal'
import { NETWORKS } from '../constants'
import { useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import { newBidEventForListings, newItemListedEvent } from 'utils/events'
import { store } from 'store/store'

const Container = styled.div`
  flex: auto;
  display: flex;
  flex-direction: column;
  //overflow-y: auto;
  margin: 12px;
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
`

const Home = () => {
  const [filters, setFilters] = useState({
    cardType: '', // 'Shop' or 'Booster'
    rarity: '', // 'epic', 'rare', 'uncommon', 'common'
    token: '', // the token's contract address
    keyword: '', // search keyword,
    sortField: 'auctionEnd', //sort by key
  })

  const { state } = useContext(store)
  const {
    wallet: { address },
  } = state

  const { network } = useParams()
  const chainId = NETWORKS[network].chainId

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } =
    useFetchListingQuery(filters, chainId)

  const handleFilterChanged = async (params) => {
    setFilters({ ...filters, ...params })
  }

  const totalCount =
    data && data.pages.length > 0 ? data.pages[0].totalCount : 0
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = newItemListedEvent(queryClient, filters, chainId, address)
    return () => PubSub.unsubscribe(token)
  }, [queryClient, filters, chainId, address])

  useEffect(() => {
    const token = newBidEventForListings(queryClient, chainId, filters)
    return () => PubSub.unsubscribe(token)
  }, [queryClient, filters, chainId])

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
                  refresh={refetch}
                />
              ))
            )}
          </InfiniteScroll>
        )}
      </div>
    </Container>
  )
}

export default Home
