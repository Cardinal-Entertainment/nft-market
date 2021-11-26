import * as React from 'react';
import {forwardRef, useContext, useState} from "react";
import LiveFeedItem from "./LiveFeedItem";
import { styled } from '@mui/material';
import Button from "@mui/material/Button";
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import {store} from "../store/store";
import Actions from "../store/actions";
import {ethers} from "ethers";
import {wmovrContractAddress, zoomContractAddress} from "../constants";

const Container = styled('div')(({ theme }) => ({
  margin: '16px 16px 16px 0',
  zIndex: 1,
  padding: '16px',
  width: '392px',
  overflowY: 'auto',
  border: '1px solid #FFFFFF',
  background: 'linear-gradient(110.99deg, #000033 100%, #100238 100%)',

  [theme.breakpoints.down('md')]: {
    margin: '0 0 0 -12px',
  },
}))

const FlexDiv = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
});

const FilterBar = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flex: 'auto',
})

const FilterItemText = styled('div')(({ color, selected, splitter }) => ({
  color: color ? color : 'white',
  textDecoration: selected ? 'underline' : '',
  padding: '0 8px',
  borderRight: splitter === 'true' ? '1px solid white' : '',
  lineHeight: splitter === 'true' ? '20px' : '',

  '&:hover': {
    cursor: 'pointer'
  }
}))

const StyledButton = styled(Button)({
  fontWeight: 'bold',
  color: 'white',
  fontFamily: 'Oswald',
})

const CloseButton = styled(Button)(({ theme }) => ({
  display: 'none',
  fontWeight: 'bold',
  color: 'white',
  fontFamily: 'Oswald',

  [theme.breakpoints.down('md')]: {
    display: 'flex'
  },
}))

const LiveFeedsSlide = (props, ref  ) => {

  const { dispatch, state } = useContext(store);
  const [filters, setFilters] = useState({
    my: true,
    general: true
  });
  const { hidelivefeeds } = props

  const clearAll = () => {
    dispatch(Actions.resetNotifications(true))
  }

  const toggleFilter = (key) => {
    setFilters({
      ...filters,
      [key]: !filters[key]
    })
  }

  const addNewElement = () => {
    dispatch(
      Actions.myNewBidEventTriggered({
        type: 'outbid',
        timestamp: Date.now() / 1000,
        content: {
          blockNumber: Date.now(),
          // itemNumber: itemNumber.toNumber(),
          itemNumber: 10,
          minPrice: 1.0,
          bidAmount: 1.0,
          seller: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0232',
          currency: 'ZOOM'
        }
      })
    )

    dispatch(
      Actions.myNewBidEventTriggered({
        type: 'sold',
        timestamp: Date.now() / 1000,
        // content: {
        //   blockNumber: Date.now(),
        //   // itemNumber: itemNumber.toNumber(),
        //   itemNumber: 10,
        //   minPrice: 1.0,
        //   seller: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0232'
        // },
        //
        content: {
          blockNumber: Date.now(),
          itemNumber: 10,
          bidAmount: 10323.5,
          winner: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0232',
          seller: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0232',
          currency: 'WMOVR'
        }
      })
    )

    dispatch(
      Actions.newBidEventTriggered({
        type: 'bid',
        timestamp: Date.now() / 1000,
        content: {
          blockNumber: Date.now(),
          // itemNumber: itemNumber.toNumber(),
          bidAmount: 10323.5,
          itemNumber: 10,
          minPrice: 1.0,
          seller: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0231'
        }
      })
    )
  }

  return (
    <Container ref={ref}>
      <FlexDiv>
        <FilterBar>
          <FilterItemText>
            VIEW:
          </FilterItemText>
          <FilterItemText selected={filters.my} splitter={"true"} color={'#41f7f8'} onClick={() => toggleFilter('my')}>
            My Alerts
          </FilterItemText>
          <FilterItemText selected={filters.general} color={'#ff59e8'} onClick={() => toggleFilter('general')}>
            General Alerts
          </FilterItemText>
        </FilterBar>

        <StyledButton onClick={addNewElement}>
          Clear All
        </StyledButton>
        {
          hidelivefeeds && (
            <CloseButton onClick={hidelivefeeds}>
              Close
            </CloseButton>
          )
        }

      </FlexDiv>
      {
        filters.my &&
        (
          state.myEvents && (
            <TransitionGroup>
              {
                state.myEvents.map((event, index) => (
                  <Collapse key={state.myEvents.length - index}>
                    <LiveFeedItem type={event.type} content={event.content} timestamp={event.timestamp} highlight={index < state.newEventsCount ? 'true' : 'false'}/>
                  </Collapse>
                ))
              }
            </TransitionGroup>
          )
        )
      }

      {
        filters.general && (
          state.events && (
            <TransitionGroup>
              {
                state.events.map((event, index) => (
                  <Collapse key={state.events.length - index}>
                    <LiveFeedItem type={event.type} content={event.content} timestamp={event.timestamp} highlight={index < state.newEventsCount ? 'true' : 'false'}/>
                  </Collapse>
                ))
              }
            </TransitionGroup>
          )
        )
      }
    </Container>
  );
}

export default forwardRef(LiveFeedsSlide);

