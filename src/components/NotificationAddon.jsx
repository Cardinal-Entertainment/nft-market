import React, {useContext, useEffect} from "react";
import { styled } from '@mui/material';
import {store} from "../store/store";
import {useQueryClient} from "react-query";
import { EVENT_TYPES, marketContractAddress, QUERY_KEYS } from '../constants';
import {useFetchLiveFeeds} from "../hooks/useLiveFeeds";

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
});

const ButtonAddonLeft = styled('div')({
  position: 'absolute',
  top: 0,
  right: '32px',
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

  const { data: newGeneralAlerts } = useFetchLiveFeeds("newGeneral")
  const { data: newMyAlerts } = useFetchLiveFeeds("newMyAlerts")

  return (

    <>
      {
        newGeneralAlerts ? (
          newGeneralAlerts > 0 && (
            <ButtonAddon onClick={clickAction}>
              {
                newGeneralAlerts >= 100 ? '99+' : newGeneralAlerts
              }
            </ButtonAddon>
          )
        ) : <></>
      }
      {
        newMyAlerts ? (
          newMyAlerts > 0 && (
            <ButtonAddonLeft onClick={clickAction}>
              {
                newMyAlerts >= 100 ? '99+' : newMyAlerts
              }
            </ButtonAddonLeft>
          )
        ) : <></>
      }
    </>
  )
};

export default NotificationAddon;
