import { Button, CircularProgress, Grid, TextField } from '@mui/material'
import React, { useContext,useState } from 'react';
import { store } from 'store/store';
import { useGetZoomAllowanceQuery } from '../hooks/useProfile'
import { useQueryClient } from 'react-query'
import { marketContractAddress, QUERY_KEYS } from '../constants'
import Slider from '@mui/material/Slider'
import { styled as muiStyled } from '@mui/material/styles'

const UserAllowanceWrapper = muiStyled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  alignItems: 'center',
  maxWidth: '1024px',
  margin: '0 auto',
  marginLeft: '0px! important;',

  '.slider-wrapper': {
    display: 'flex',
    alignItems: 'center',
    margin: '12px 0px',

    '.slider': {
      paddingRight: '24px',
    },
  },

  '.button-wrapper': {
    marginTop: '16px',
  },

}))

const UserAllowance = () => {
  const {
    state: { wallet, contracts },
  } = useContext(store)
  const { data: currentAllowance, isLoading } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract
  )
  const { zoomBalance } = wallet
  const [zoomAllowance, setZoomAllowance] = useState(0)
  const [isSettingAllowance, setIsSettingAllowance] = useState(false)

  const handleSliderChange = (event, newValue) => {
    setZoomAllowance(newValue)
  }

  const handleInputChange = (event) => {
    setZoomAllowance(
      event.target.value === '' ? '' : Number(event.target.value)
    )
  }

  const handleBlur = () => {
    if (zoomAllowance < 0) {
      setZoomAllowance(0)
    } else if (zoomAllowance > zoomBalance) {
      setZoomAllowance(zoomBalance)
    }
  }

  const queryClient = useQueryClient()

  const onSetZoomAllowance = async () => {
    try {
      setIsSettingAllowance(true)
      if (zoomAllowance < currentAllowance) {
        const tx = await contracts.ZoomContract.decreaseAllowance(
          marketContractAddress,
          currentAllowance - zoomAllowance
        )
        await tx.wait()
      } else if (zoomAllowance > currentAllowance) {
        const tx = await contracts.ZoomContract.increaseAllowance(
          marketContractAddress,
          zoomAllowance - currentAllowance
        )
        await tx.wait()
      }

      queryClient.setQueryData(
        [
          QUERY_KEYS.zoomAllowance,
          {
            userAddress: wallet.address,
            zoomTokenContract: contracts.ZoomContract.address,
          },
        ],
        zoomAllowance
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsSettingAllowance(false)
    }
  }

  return (
    <>
      <UserAllowanceWrapper>
        {isLoading ? (
          <CircularProgress></CircularProgress>
        ) : (
          <h2>Your current zoom allowance: {currentAllowance} ZOOM</h2>
        )}
        <Grid className="slider-wrapper" container>
          <Grid className="slider" item xs={12} md={9}>
            <Slider
              value={zoomAllowance}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              min={0}
              max={zoomBalance ? parseInt(zoomBalance) : 0}
            />
          </Grid>
          <Grid item xs={9} md={3}>
            <TextField
              value={zoomAllowance}
              size="large"
              fullWidth
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={parseInt(zoomBalance) < zoomAllowance}
              helperText={parseInt(zoomBalance) < zoomAllowance ? 'Exceeds your ZOOM balance' : null}
              variant={"standard"}
              inputProps={{
                step: 500,
                min: 0,
                max: parseInt(zoomBalance) || 0,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </Grid>
        <Grid className="button-wrapper">
          <Button
            style={{
              minWidth: '150px',
            }}
            onClick={onSetZoomAllowance}
            disabled={isSettingAllowance}
            variant="contained"
          >
            {isSettingAllowance ? (
              <CircularProgress />
            ) : (
              `Set Zoom Allowance (${zoomAllowance} zoom)`
            )}
          </Button>
        </Grid>
      </UserAllowanceWrapper>
    </>
  )
}

export default UserAllowance;
