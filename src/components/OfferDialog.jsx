import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { ethers } from 'ethers'

const FlexRow = styled.div`
  display: flex;
  align-items: flex-start;

  span {
    margin-top: 24px;
    margin-left: 10px;
    font-size: 18px;
  }
`;

const OfferDialog = ({
  currency,
  minAmount,
  maxAmount,
  onConfirm,
  disabled,
  quickBid,
  mylisting
}) => {
  console.log("opened:",minAmount.toString());
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(minAmount);
  const [inputInvalid, setInputInvalid] = useState('');

console.log("dialog input start:",input.toString());

  useEffect(() => {
    setInput(minAmount);
  }, [minAmount]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (currency === 'ZOOM') {
      if (e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 188) {
        // 'e', '.', ',' charaters
        e.preventDefault();
      }
    }
  };

  const handleAmountChanged = (e) => {
    const value = e.target.value;

    let isDecimalOverflow = false;
    if (currency === 'WMOVR' && value.toString().includes('.')) {
      if (value.toString().split('.')[1].length > 4) {
        isDecimalOverflow = true;
      }
    }

    if (isDecimalOverflow) {
      setInput(parseFloat(value).toFixed(4).toString());
    } else {
      setInput(value);
    }
  };

  const handleConfirm = () => {
    console.log("Dialog input,min,max:", input.toString(), minAmount.toString(),maxAmount.toString());

    if (input.lt(minAmount.toString())) {
      console.log('WHAT THE HELL');
      setInputInvalid('Set bigger amount');
    } else if (input.gt(ethers.utils.parseEther(maxAmount.toString()))) {
      setInputInvalid("You don't have enough coin");
    } else {
      setInputInvalid('');
      onConfirm(input);
      setOpen(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        disabled={disabled}
        className={quickBid ? 'button-bid' : ''}
      >
        {
          mylisting ? 'My Listing' :
            (quickBid
              ? 'Quick bid (' +
              Math.round(minAmount * 10000) / 10000.0 +
              ' ' +
              currency +
              ')'
              : 'Make Offer')
        }

      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Make Offer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount you want to offer
          </DialogContentText>
          <FlexRow>
            <TextField
              autoFocus
              margin="dense"
              id="amount"
              label="Offer Amount"
              type="number"
              variant="standard"
              value={
                currency === 'ZOOM'
                  ? ethers.utils.formatEther(input.toString())
                  : ethers.utils.formatEther(input.toString())
              }
              onChange={handleAmountChanged}
              onKeyDown={onKeyDown}
              error={inputInvalid !== ''}
              helperText={inputInvalid}
              inputProps={{ step: currency === 'WMOVR' ? 0.0001 : 1 }}
            />
            <span>{currency}</span>
          </FlexRow>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log("at click",input.toString());
              handleConfirm(input);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OfferDialog;
