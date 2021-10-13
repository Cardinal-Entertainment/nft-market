import React, { useContext, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import metamaskLogo from "../assets/metamask-face.png";
import movrLogo from "../assets/movr_logo.png";
import zoomLogo from "../assets/zoombies_logo_round_plaque.svg";
import Tooltip from "@mui/material/Tooltip";
import { store } from "store/store";
import { Link } from "react-router-dom";
import { faEdit, faShoppingBag } from "@fortawesome/free-solid-svg-icons";

import { getWalletWMOVRBalance, getWalletZoomBalance } from "../utils/wallet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
  width: 300px;
  background: rgba(11, 11, 11, 0.87);
  display: flex;
  flex-direction: column;
  padding: 8px;
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
`;

const TooltipContent = styled.span`
  font-size: 16px;
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

  const getZoomBalance = async () => {
    const bal = await getWalletZoomBalance(contracts.ZoomContract, address);
    setZoomBalance(bal);
  };

  const getWMOVRBalance = async () => {
    const bal = await getWalletWMOVRBalance(contracts.WMOVRContract, address);
    setWMOVRBalance(bal);
  };

  useEffect(() => {
    if (contracts.ZoomContract && address) {
      getZoomBalance();
    }
    if (contracts.WMOVRContract && address) {
      getWMOVRBalance();
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
        <NavItem color="white">
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
              {zoomBalance.toLocaleString()} ZOOM
            </span>
          </Tooltip>
        </NavItem>
      </UserBalances>
    </Container>
  );
};

export default Navbar;
