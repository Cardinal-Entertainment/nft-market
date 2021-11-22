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
  backgroundColor: '#f00',
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
    state.newEventsCount > 0 && (
      <ButtonAddon onClick={clickAction}>
        {
          state.newEventsCount >= 100 ? '99+' : state.newEventsCount
        }
      </ButtonAddon>
    )
  )
};

export default NotificationAddon;
