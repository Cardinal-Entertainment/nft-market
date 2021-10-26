import React, { useContext, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import metamaskLogo from "../assets/metamask-face.png";
import movrLogo from "../assets/movr_logo.png";
import zoomLogo from "../assets/zoombies_logo_round_plaque.svg";
import Tooltip from "@mui/material/Tooltip";
import { store } from "store/store";
import {Link} from "react-router-dom";
import { faEdit, faShoppingBag } from "@fortawesome/free-solid-svg-icons";

import {addAssetToMetamask, getWalletWMOVRBalance, getWalletZoomBalance, unWrapMOVR, wrapMOVR} from "../utils/wallet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WrapDialog from "./WrapDialog";
import {ButtonGroup, FormControl, MenuItem, Select} from "@mui/material";
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';

const Container = styled.div`
  width: 300px;
  background: rgba(11, 11, 11, 0.87);
  display: flex;
  flex-direction: column;
  padding: 8px;

  & .dropdown-buttons {
    margin: 10px 0;

    & .select {
      color: white;
      background-color: #1976d2;
    }
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  color: ${({ color }) => color};
  font-size: 18px;
  height: 50px;

  span {
    display: flex;
    align-items: center;
  }

  img {
    width: 50px;
    margin-right: 15px;
  }

  img.zoom {
    width: 40px;
    padding: 0 5px;
  }

  svg {
    padding: 0 15px 0 5px;

    &.marketplace {
      padding-right: 22px;
    }
  }
`;

const NavigationSection = styled.div`
  flex: 1;
  padding: 5px;

  ${NavItem} {
    font-size: 20px;
  }

  ${NavItem}:hover {
    color: #03c1e8;
    cursor: pointer;
  }
`;

const UserBalances = styled.div`
  padding: 5px;
  padding-top: 10px;
  border-top: 1px solid white;

  div {
    justify-content: space-between;
  }
`;

const TooltipContent = styled.span`
  font-size: 16px;
`;

const ButtonGroupContainer = styled.div`
  margin: 12px;
  
  & .popper {
    width: 276px;
    
    & .popper-menuitem div {
      flex: auto;
    }
  }
`;

const Navbar = () => {
  const theme = useTheme();
  const [zoomBalance, setZoomBalance] = useState("");
  const [WMOVRBalance, setWMOVRBalance] = useState("");

  const { state } = useContext(store);
  const {
    wallet: { address, balance },
    contracts,
  } = state;

  const shortWallet = address
    ? `${address.substr(0, 10)}...${address.substr(34)}`
    : "";

  const options = ['UNWRAP WMOVR','WRAP MOVR', 'DISPLAY WMOVR', 'DISPLAY ZOOM'];
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleMenuItemClick = async (event, index) => {
    setSelectedIndex(index);

    if (index === 2) {
      await handleAddAssetToMetamask('WMOVR')
    } else if (index === 3) {
      await handleAddAssetToMetamask('ZOOM')
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const getZoomBalance = async () => {
    const bal = await getWalletZoomBalance(contracts.ZoomContract, address);
    setZoomBalance(bal);
  };

  const getWMOVRBalance = async () => {
    const bal = await getWalletWMOVRBalance(contracts.WMOVRContract, address);
    setWMOVRBalance(bal);
  };

  const handleUnwrapMOVR = async( amount )  => {
    if (amount > 0) {
      await unWrapMOVR(contracts.WMOVRContract, amount.toString())
    }
  }

  const handleWrapMOVR = async( amount )  => {
    if (amount > 0) {
      await wrapMOVR(contracts.WMOVRContract, amount.toString())
    }
  }

  const handleAddAssetToMetamask = async (tokenSymbol) => {
    await addAssetToMetamask(tokenSymbol, address)
  }


  useEffect(() => {
    if (contracts.ZoomContract && address) {
      getZoomBalance();

      contracts.ZoomContract.provider.on('block', () => {
        getZoomBalance();
      });
    }
    if (contracts.WMOVRContract && address) {
      getWMOVRBalance();

      contracts.WMOVRContract.provider.on('block', () => {
        console.log("wmovr block")
        getWMOVRBalance();
      });
    }

  }, [contracts, address]);

  return (
    <Container>
      <NavigationSection>
        <Link to="/">
          <NavItem color="white">
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="lg"
              className="marketplace"
            />
            Live Auctions
          </NavItem>
        </Link>
        <Link to="/new">
          <NavItem color="white">
            <FontAwesomeIcon icon={faEdit} size="lg" />
            New Listing
          </NavItem>
        </Link>
      </NavigationSection>
      <UserBalances>
        <NavItem color={theme.colors.metamaskOrange}>
          <Tooltip
            title={<TooltipContent>{address}</TooltipContent>}
            arrow
            placement="right"
          >
            <span>
              <img src={metamaskLogo} />
              {shortWallet}
            </span>
          </Tooltip>
        </NavItem>
        <NavItem color="white">
          <Tooltip
            title={
              <TooltipContent>{Number(WMOVRBalance) / 1} WMOVR</TooltipContent>
            }
            arrow
            placement="right"
          >
            <span>
              <img src={movrLogo} />
              {Number(WMOVRBalance).toFixed(4)} WMOVR
            </span>
          </Tooltip>
        </NavItem>
        <NavItem color="white" onClick={handleWrapMOVR}>
          <Tooltip
            title={<TooltipContent>{balance} MOVR</TooltipContent>}
            arrow
            placement="right"
          >
            <span>
              <img src={movrLogo} />
              {Number(balance).toFixed(4)} MOVR
            </span>
          </Tooltip>
        </NavItem>
        <NavItem color="white">
          <Tooltip
            title={
              <TooltipContent>
                {zoomBalance.toLocaleString()} ZOOM Tokens
              </TooltipContent>
            }
            arrow
            placement="right"
          >
            <span>
              <img className="zoom" src={zoomLogo} />
              {Number(Number(zoomBalance).toFixed(4)).toLocaleString()} ZOOM
            </span>
          </Tooltip>
        </NavItem>
      </UserBalances>

      <ButtonGroupContainer>
        <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button" style={{
          width: '100%',
          height: '40px',
        }}>
          <Button onClick={handleToggle} style={{flex: 'auto'}}>{options[selectedIndex]}</Button>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          className={'popper'}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    <MenuItem className={"popper-menuitem"} value={'unwrap-movr'} onClick={(event) => handleMenuItemClick(event, 0)}>
                      <WrapDialog
                        currency={'WMOVR'}
                        maxAmount={WMOVRBalance}
                        onConfirm={handleUnwrapMOVR}
                        disabled={WMOVRBalance <= 0}/>
                    </MenuItem>
                    <MenuItem className={"popper-menuitem"} value={'wrap-movr'} onClick={(event) => handleMenuItemClick(event, 1)}>
                      <WrapDialog
                        currency={'MOVR'}
                        maxAmount={balance}
                        onConfirm={handleWrapMOVR}
                        disabled={balance <= 0}
                      />
                    </MenuItem>
                    <MenuItem className={"popper-menuitem"} value={'add-wmovr'} onClick={(event) => handleMenuItemClick(event, 2)}>
                      Add WMOVR
                    </MenuItem>
                    <MenuItem className={"popper-menuitem"} value={'add-zoom'} onClick={(event) => handleMenuItemClick(event, 3)}>
                      Add ZOOM
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </ButtonGroupContainer>
    </Container>
  );
};

export default Navbar;
