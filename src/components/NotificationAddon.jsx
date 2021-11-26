import React, {useContext} from "react";
import { styled } from '@mui/material';
import {store} from "../store/store";

const ButtonAddon = styled('div')({
  position: 'absolute',
  top: 0,
  right: '8px',
  padding: '0 4px',
  height: '24px',
  minWidth: '16px',
  color: 'white',
  backgroundColor: '#41f7f8',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
})

const ButtonAddonRight = styled('div')({
  position: 'absolute',
  top: 0,
  left: '8px',
  padding: '0 4px',
  height: '24px',
  minWidth: '16px',
  color: 'white',
  backgroundColor: '#ff59e8',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
})

const NotificationAddon = ( props ) => {

  const { clickAction } = props
  const {  state } = useContext(store);

  return (

    <>
      {
        state.newEventsCount > 0 && (
          <ButtonAddon onClick={clickAction}>
            {
              state.newEventsCount >= 100 ? '99+' : state.newEventsCount
            }
          </ButtonAddon>
        )
      }
      {
        state.myNewEventsCount > 0 && (
          <ButtonAddonRight onClick={clickAction}>
            {
              state.myNewEventsCount >= 100 ? '99+' : state.myNewEventsCount
            }
          </ButtonAddonRight>
        )
      }
    </>
  )
};

export default NotificationAddon;
