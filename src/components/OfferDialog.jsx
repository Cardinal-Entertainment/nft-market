import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useState } from "react";
import styled from "styled-components/macro";

const FlexRow = styled.div`
  display: flex;
  align-items: flex-end;

  span {
    margin-left: 10px;
    margin-bottom: 5px;
    font-size: 18px;
  }
`;

const OfferDialog = ({ currency, onConfirm, disabled }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen} disabled={disabled}>
        Make Offer
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
              id="name"
              label="Offer Amount"
              type="number"
              variant="standard"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <span>{currency}</span>
          </FlexRow>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              onConfirm(input);
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
