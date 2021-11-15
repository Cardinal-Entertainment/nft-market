import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, {useEffect, useState} from "react";
import styled from "styled-components/macro";


const Container = styled.div`
`;

const FlexRow = styled.div`
  display: flex;
  align-items: flex-start;

  span {
    margin-top: 24px;
    margin-left: 10px;
    font-size: 18px;
  }
`;

const SelectItem = styled.div`
  display: flex;
  align-items: flex-start;
  flex: auto;

  span {
    margin-top: 24px;
    margin-left: 10px;
    font-size: 18px;
  }
`;

const WrapDialog = ({ currency, maxAmount, onConfirm, disabled }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(maxAmount);
  const [inputInvalid, setInputInvalid] = useState(false);

  useEffect(() => {
    setInput(Math.floor((maxAmount * 1000)) / 1000);
    if (open === true) {
      setOpen(true)
    }

  }, [maxAmount]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAmountChanged = (e) => {
    const value = e.target.value

    if (value < 0) {
      setInput(0)
      return
    }

    let isDecimalOverflow = false
    if (value.toString().includes('.')) {
      if (value.toString().split(".")[1].length > 3) {
        isDecimalOverflow = true
      }
    }

    if (isDecimalOverflow) {
      setInput(parseFloat(value).toFixed(3).toString())
    } else {
      setInput(value)
    }
  }

  const handleConfirm = () => {
    if (parseFloat(input) > maxAmount) {
      setInputInvalid(true)

    } else {
      setInputInvalid(false)
      onConfirm(input)
      setOpen(false);
    }
  }

  return (
    <Container>
      <SelectItem variant="contained" onClick={handleClickOpen} disabled={disabled} className={"wrap-button"}>
        {currency === 'MOVR' ? 'Wrap MOVR' : 'Unwrap WMOVR'}
      </SelectItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currency === "MOVR" ? "Wrap MOVR" : "Unwrap MOVR"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount you want to {currency === "MOVR" ? 'wrap' : 'unwrap'}
          </DialogContentText>
          <FlexRow>
            <TextField
              autoFocus
              margin="dense"
              id="amount"
              label={currency === 'MOVR' ? "Wrap Amount" : "Unwrap Amount"}
              type="number"
              variant="standard"
              value={input}
              onChange={handleAmountChanged}
              error={inputInvalid}
              helperText={inputInvalid && 'Set smaller amount'}
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
    </Container>
  );
};

export default WrapDialog;
