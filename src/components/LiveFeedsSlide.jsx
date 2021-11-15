import * as React from 'react';
import {forwardRef, useContext } from "react";
import LiveFeedItem from "./LiveFeedItem";
import { styled} from '@mui/material';
import Button from "@mui/material/Button";
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import {store} from "../store/store";
import Actions from "../store/actions";

const Container = styled('div')({
  margin: '16px 16px 16px 0',
  padding: '16px',
  width: '392px',
  overflowY: 'auto',
  border: '1px solid #FFFFFF',
  background: 'linear-gradient(110.99deg, #000033 100%, #100238 100%)'
});

const FlexDiv = styled('div')({
  display: 'flex'
});

const ClearButton = styled(Button)({
  marginLeft: 'auto',
  marginRight: '0',
  fontWeight: 'bold',
  color: 'white'
})


const LiveFeedsSlide = (props, ref  ) => {

  const { dispatch, state } = useContext(store);

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
      <FlexDiv style={{display: 'flex'}}>
        <ClearButton onClick={clearAll}>
          Clear All
        </ClearButton>
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

