import { Button, CircularProgress, Grid, TextField } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { store } from 'store/store'
import { useGetZoomAllowanceQuery } from '../hooks/useProfile'
import { ethers } from 'ethers'
import { useQueryClient } from 'react-query'
import {
  marketContractAddress,
  maxZOOMAllowance,
  QUERY_KEYS,
} from '../constants'
import Slider from '@mui/material/Slider'
import { styled as muiStyled } from '@mui/material/styles'
import { compareAsBigNumbers } from '../utils/BigNumbers'
import { waitForTransaction } from 'utils/transactions'

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

const UserAllowance = ({ initial }) => {
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

  useEffect(() => {
    if (initial !== undefined) {
      setZoomAllowance(parseInt(ethers.utils.formatEther(initial.toString())))
    } else if (currentAllowance !== undefined) {
      setZoomAllowance(
        parseInt(ethers.utils.formatEther(currentAllowance.toString()))
      )
    }
  }, [initial, currentAllowance])

  const handleSliderChange = (event, newValue) => {
    setZoomAllowance(newValue)
  }

  const handleInputChange = (event) => {
    setZoomAllowance(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (zoomAllowance < 0) {
      setZoomAllowance(0)
    } else if (
      compareAsBigNumbers(zoomAllowance, parseInt(zoomBalance)) === 1
    ) {
      setZoomAllowance(zoomBalance)
    }
  }

  const queryClient = useQueryClient()

  const onSetZoomAllowance = async () => {
    try {
      setIsSettingAllowance(true)
      if (
        ethers.utils.parseEther(zoomAllowance.toString()).lt(currentAllowance)
      ) {
        const tx = await contracts.ZoomContract.decreaseAllowance(
          marketContractAddress,
          currentAllowance.sub(
            ethers.utils.parseEther(zoomAllowance.toString())
          )
        )
        await waitForTransaction(tx)
      } else if (
        ethers.utils.parseEther(zoomAllowance.toString()).gt(currentAllowance)
      ) {
        const tx = await contracts.ZoomContract.increaseAllowance(
          marketContractAddress,
          ethers.utils
            .parseEther(zoomAllowance.toString())
            .sub(currentAllowance)
        )
        await waitForTransaction(tx)
      }

      queryClient.setQueryData(
        [
          QUERY_KEYS.zoomAllowance,
          {
            userAddress: wallet.address,
            zoomTokenContract: contracts.ZoomContract.address,
          },
        ],
        ethers.utils.parseEther(zoomAllowance.toString())
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsSettingAllowance(false)
    }
  }

  return (
    <UserAllowanceWrapper>
      {isLoading ? (
        <CircularProgress></CircularProgress>
      ) : (
        <h2>
          Your current zoom allowance:{' '}
          {ethers.utils.formatEther(currentAllowance)} ZOOM
        </h2>
      )}
      <Grid className="slider-wrapper" container>
        <Grid className="slider" item xs={12} md={8}>
          <Slider
            value={zoomAllowance}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={0}
            max={maxZOOMAllowance}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <TextField
            value={zoomAllowance === 0 ? '' : zoomAllowance}
            size="large"
            fullWidth
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={
              compareAsBigNumbers(parseInt(zoomBalance), zoomAllowance) === -1
            }
            helperText={
              compareAsBigNumbers(parseInt(zoomBalance), zoomAllowance) === -1
                ? 'Exceeds your ZOOM balance'
                : null
            }
            variant={'standard'}
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
  )
}

export default UserAllowance
