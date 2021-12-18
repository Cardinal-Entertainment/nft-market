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
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(ethers.utils.formatEther(minAmount));
  const [inputInvalid, setInputInvalid] = useState('');

  useEffect(() => {
    setInput(ethers.utils.formatEther(minAmount));
  }, [minAmount]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAmountChanged = (e) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleConfirm = () => {
    if (ethers.utils.parseEther(input).lt(minAmount)) {
      setInputInvalid('Set bigger amount');
    } else if (ethers.utils.parseEther(input).gt(maxAmount)) {
      setInputInvalid("You don't have enough coin");
    } else {
      setInputInvalid('');
      onConfirm(parseFloat(input));
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
              ? `Quick bid (${ethers.utils.formatEther(minAmount)} ${currency})` : 'Make Offer')
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
              value={input
                // currency === 'ZOOM'
                //   ? parseInt(input).toString()
                //   : parseFloat(input).toFixed(4)
              }
              onChange={handleAmountChanged}
              // onKeyDown={onKeyDown}
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
