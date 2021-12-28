import { Button, Menu, MenuItem } from '@mui/material';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import {
  addAssetToMetamask,
} from '../utils/wallet';
import { store } from 'store/store';

const Container = styled.div`
  margin: 16px 0;

  &.wrap-movr-menu {
    width: 276px !important;
  }
`;

const WrapMovrMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { state } = useContext(store);

  const {
    contracts,
  } = state;

  const toggleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen((prevState) => !prevState);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  return (
    <Container>
      <Button
        onClick={toggleMenu}
        aria-controls="basic-menu"
        aria-expanded={isMenuOpen ? 'true' : undefined}
        aria-haspopup="true"
        variant="contained"
        style={{
          width: '100%',
          height: '40px',
          flex: 'auto',
        }}
      >
        Add Coins to Metamask
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          style: {
            width: 276,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            addAssetToMetamask('MOVR', contracts.WMOVRContract.address);
            handleClose();
          }}
        >
          Add MOVR to Metamask
        </MenuItem>
        <MenuItem
          onClick={() => {
            addAssetToMetamask('ZOOM', contracts.ZoomContract.address);
            handleClose();
          }}
        >
          Add ZOOM to Metamask
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default WrapMovrMenu;
