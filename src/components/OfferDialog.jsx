import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, {useEffect, useState} from "react";
import styled from "styled-components/macro";

const FlexRow = styled.div`
  display: flex;
  align-items: flex-start;

  span {
    margin-top: 24px;
    margin-left: 10px;
    font-size: 18px;
  }
`;

const OfferDialog = ({ currency, minAmount, maxAmount, onConfirm, disabled, quickBid }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(minAmount);
  const [inputInvalid, setInputInvalid] = useState("");

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
      if(e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 188){ // 'e', '.', ',' charaters
        e.preventDefault();
      }
    }
  }

  const handleAmountChanged = (e) => {
    const value = e.target.value

    let isDecimalOverflow = false
    if (currency === 'WMOVR' && value.toString().includes('.')) {
      if (value.toString().split(".")[1].length > 4) {
        isDecimalOverflow = true
      }
    }

    if (isDecimalOverflow) {
      setInput(parseFloat(value).toFixed(4).toString())
    } else {
      setInput(value)
    }
  }

  const handleConfirm = () => {
    if (parseFloat(input) < minAmount) {
      setInputInvalid("Set bigger amount")
    } else if (parseFloat(input) > maxAmount) {
      setInputInvalid("You don't have enough coin")
    } else {
      setInputInvalid("")
      onConfirm(input)
      setOpen(false);
    }
  }

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen} disabled={disabled} className={quickBid ? "button-bid" : ''}>
        {quickBid ? 'Quick bid (' + Math.round(minAmount * 10000) / 10000.0 + ' ' + currency + ')' : 'Make Offer'}
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
              value={currency === 'ZOOM' ? parseInt(input).toString() : parseFloat(input).toFixed(4)}
              onChange={handleAmountChanged}
              onKeyDown={onKeyDown}
              error={inputInvalid !== ""}
              helperText={inputInvalid}
              inputProps={{ step: currency === 'WMOVR' ? 0.0001 : 1}}
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
