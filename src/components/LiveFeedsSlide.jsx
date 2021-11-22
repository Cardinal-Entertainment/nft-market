import * as React from 'react';
import {forwardRef, useContext } from "react";
import LiveFeedItem from "./LiveFeedItem";
import { styled } from '@mui/material';
import Button from "@mui/material/Button";
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import {store} from "../store/store";
import Actions from "../store/actions";

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

const ClearButton = styled(Button)({
  fontWeight: 'bold',
  color: 'white'
})

const CloseButton = styled(Button)(({ theme }) => ({
  display: 'none',
  fontWeight: 'bold',
  color: 'white',

  [theme.breakpoints.down('md')]: {
    display: 'flex'
  },
}))

const LiveFeedsSlide = (props, ref  ) => {

  const { dispatch, state } = useContext(store);
  const { hideLiveFeeds } = props

  const clearAll = () => {
    dispatch(Actions.resetNotifications(true))
  }

  // const addNewElement = () => {
  //   dispatch(
  //     Actions.newBidEventTriggered({
  //       type: 'new',
  //       timestamp: Date.now() / 1000,
  //       content: {
  //         blockNumber: Date.now(),
  //         // itemNumber: itemNumber.toNumber(),
  //         itemNumber: 10,
  //         minPrice: 1.0,
  //         seller: '0x24213bd4cEc78A8843B50b9503c1d56eEA4d0232'
  //       }
  //     })
  //   )
  // }

  return (
    <Container ref={ref} {...props}>
      <FlexDiv>
        <ClearButton onClick={clearAll}>
          Clear All
        </ClearButton>
        <CloseButton onClick={hideLiveFeeds}>
          Close
        </CloseButton>
      </FlexDiv>
      {
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
      }
    </Container>
  );
}

export default forwardRef(LiveFeedsSlide);

