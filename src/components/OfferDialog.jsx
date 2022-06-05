import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ethers } from 'ethers'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { styled as styled1 } from '@mui/material/styles'

import '../assets/scss/OfferDialog.scss'
import { formatBigNumberAmount } from 'utils/currencies'

const Container = styled.div`
  .button-readonly {
    background: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.26);
  }
  .button-mylisting {
    background: rgba(40, 162, 184, 1);
    color: rgba(0, 0, 0, 1);
  }
  .button-buynow {
    background: rgba(198, 232, 4, 1);
    color: rgba(0, 0, 0, 1);
  }
`

const FlexRow = styled.div`
  display: flex;
  align-items: flex-start;

  span {
    margin-top: 24px;
    margin-left: 10px;
    font-size: 18px;
  }
`

const CustomWidthTooltip = styled1(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 200,
    fontSize: '16px',
  },
})

const OfferDialog = ({
  currency,
  minAmount,
  maxAmount,
  onConfirm,
  disabled,
  tooltip,
  quickBid,
  mylisting,
  minIncrement,
  timestamp,
  saleToken,
  network,
}) => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(
    formatBigNumberAmount(minAmount.toString(), saleToken, network)
  )
  const [inputInvalid, setInputInvalid] = useState('')

  useEffect(() => {
    if (minAmount) {
      setInput(formatBigNumberAmount(minAmount.toString(), saleToken, network))
    }
  }, [minAmount, saleToken, network])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleAmountChanged = (e) => {
    const value = e.target.value
    setInput(value)
  }

  const handleConfirm = () => {
    if (ethers.utils.parseEther(input).lt(minAmount)) {
      setInputInvalid('Set bigger amount')
    } else if (ethers.utils.parseEther(input).gt(maxAmount)) {
      setInputInvalid("You don't have enough coin")
    } else {
      setInputInvalid('')
      onConfirm(parseFloat(input))
      setOpen(false)
    }
  }

  let offerButtonClassName = ''
  if (quickBid && disabled) {
    offerButtonClassName = 'button-bid button-mylisting'
  } else if (quickBid && timestamp !== 0 && !disabled) {
    offerButtonClassName = 'button-bid'
  } else if (timestamp === 0 && !disabled && quickBid) {
    offerButtonClassName = 'button-bid button-buynow'
  } else if (!quickBid && disabled) {
    offerButtonClassName = 'button-readonly'
  } else {
    offerButtonClassName = ''
  }

  let buttonText = ''

  if (timestamp === 0) {
    // Buy now
    buttonText = quickBid
      ? `Buy now (${formatBigNumberAmount(
          minAmount.toString(),
          saleToken,
          network
        )} ${currency})`
      : 'Buy now'
  } else {
    buttonText = quickBid
      ? `Quick bid (${formatBigNumberAmount(
          minAmount.toString(),
          saleToken,
          network
        )} ${currency})`
      : 'Make Offer'
  }
  return (
    <Container>
      {disabled && tooltip && !mylisting ? (
        <CustomWidthTooltip title={tooltip} arrow placement="top">
          <p className={`${offerButtonClassName} offer-tool-tip`}>
            {mylisting ? 'My Listing' : buttonText}
          </p>
        </CustomWidthTooltip>
      ) : (
        <Button
          variant="contained"
          onClick={handleClickOpen}
          className={offerButtonClassName}
          disabled={disabled}
        >
          {mylisting ? 'My Listing' : buttonText}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Make Offer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount you want to offer
          </DialogContentText>
          <FlexRow>
            <TextField
              style={{ flex: 1 }}
              autoFocus
              margin="dense"
              id="amount"
              label="Offer Amount"
              type="number"
              variant="standard"
              value={input}
              onChange={handleAmountChanged}
              error={inputInvalid !== ''}
              helperText={inputInvalid}
              inputProps={{ step: parseFloat(minIncrement), min: 0 }}
            />
            <span>{currency}</span>
          </FlexRow>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleConfirm(input)
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default OfferDialog
