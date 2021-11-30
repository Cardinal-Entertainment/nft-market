import { Button, Menu, MenuItem } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import WrapDialog from './WrapDialog';
import {
  unWrapMOVR,
  wrapMOVR,
  getWalletWMOVRBalance,
  addAssetToMetamask,
} from '../utils/wallet';
import { store } from 'store/store';

const Container = styled.div`
  margin: 16px 0;

  &.wrap-movr-menu {
    width: 276px !important;
  }
`;

const handleUnwrapMOVR = async (amount, WMOVRContract) => {
  try {
    if (amount > 0) {
      await unWrapMOVR(WMOVRContract, amount.toString());
    }
  } catch (e) {
    console.error('Failed to unwrap movr: ', e);
  }
};

const handleWrapMOVR = async (amount, WMOVRContract) => {
  try {
    if (amount > 0) {
      await wrapMOVR(WMOVRContract, amount.toString());
    }
  } catch (e) {
    console.error('Failed to wrap movr: ', e);
  }
};

const WrapMovrMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isWrapMovrModalOpen, setIsWrapMovrModalOpen] = useState(false);
  const [isUnWrapMovrModalOpen, setIsUnWrapMovrModalOpen] = useState(false);
  const [WMOVRBalance, setWMOVRBalance] = useState(null);

  const { state } = useContext(store);

  const {
    wallet: { address, balance },
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

  useEffect(() => {
    const getUserWMOVRBalance = async () => {
      if (contracts.WMOVRContract && address) {
        const balance = await getWalletWMOVRBalance(
          contracts.WMOVRContract,
          address
        );
        setWMOVRBalance(balance);
      }
    };

    getUserWMOVRBalance();
  }, [address, contracts.WMOVRContract]);

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
        WRAP MOVR
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
          selected={isUnWrapMovrModalOpen}
          onClick={() => setIsUnWrapMovrModalOpen(true)}
        >
          UNWRAP WMOVR
        </MenuItem>
        <MenuItem
          selected={isWrapMovrModalOpen}
          onClick={() => setIsWrapMovrModalOpen(true)}
        >
          WRAP WMOVR
        </MenuItem>
        <MenuItem
          onClick={() => {
            addAssetToMetamask('WMOVR', contracts.WMOVRContract.address);
            handleClose();
          }}
        >
          Add WMOVR to Metamask
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
      <WrapDialog
        currency={'WMOVR'}
        maxAmount={WMOVRBalance}
        onConfirm={handleUnwrapMOVR}
        disabled={WMOVRBalance <= 0}
        open={isUnWrapMovrModalOpen}
        handleClose={() => {
          setIsUnWrapMovrModalOpen(false);
        }}
      />
      <WrapDialog
        currency={'MOVR'}
        maxAmount={balance}
        onConfirm={handleWrapMOVR}
        disabled={balance <= 0}
        open={isWrapMovrModalOpen}
        handleClose={() => {
          setIsWrapMovrModalOpen(false);
        }}
      />
    </Container>
  );
};

export default WrapMovrMenu;
