import React from 'react'
import { styled } from '@mui/material'
import { useFetchLiveFeeds } from '../hooks/useLiveFeeds'
import { FEED_TYPE } from 'utils/events'

const ButtonAddon = styled('div')({
  position: 'absolute',
  top: 0,
  right: '8px',
  padding: '0 4px',
  height: '24px',
  minWidth: '16px',
  color: 'white',
  backgroundColor: '#af46a1',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
})

const ButtonAddonLeft = styled('div')({
  position: 'absolute',
  top: 0,
  right: '32px',
  padding: '0 4px',
  height: '24px',
  minWidth: '16px',
  color: 'white',
  backgroundColor: 'rgba(40, 162, 184, 1)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
})

const NotificationAddon = (props) => {
  const { clickAction } = props

  const { data: newGeneralAlerts } = useFetchLiveFeeds(FEED_TYPE.observer)
  const { data: newMyAlerts } = useFetchLiveFeeds(FEED_TYPE.self)

  return (
    <>
      {newGeneralAlerts && newGeneralAlerts.length > 0 ? (
        <ButtonAddon onClick={clickAction}>
          {newGeneralAlerts.length >= 100 ? '99+' : newGeneralAlerts.length}
        </ButtonAddon>
      ) : null}
      {newMyAlerts && newMyAlerts.length > 0 ? (
        <ButtonAddonLeft onClick={clickAction}>
          {newMyAlerts.length >= 100 ? '99+' : newMyAlerts.length}
        </ButtonAddonLeft>
      ) : null}
    </>
  )
}

export default NotificationAddon
