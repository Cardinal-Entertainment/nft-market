import React, { useContext, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import metamaskLogo from "../assets/metamask-face.png";
import movrLogo from "../assets/movr_logo.png";
import zoomLogo from "../assets/zoombies_logo_round_plaque.svg";
import marketplaceIcon from "../assets/marketplace-icon.svg";
import Tooltip from "@mui/material/Tooltip";
import { store } from "store/store";

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

  img.marketplace {
    width: 30px;
    padding: 0 5px;
  }

  img.zoom {
    width: 40px;
    padding: 0 5px;
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
  const [zoomBalance, setZoomBalance] = useState(0);

  const { state } = useContext(store);
  const { wallet, contracts } = state;
  const shortWallet = wallet
    ? `${wallet.substr(0, 10)}...${wallet.substr(34)}`
    : "";

  const getZoomBalance = async () => {
    const balance = await contracts.ZoomContract.balanceOf(state.wallet);
    setZoomBalance(balance / 1000000000000000000);
  };

  useEffect(() => {
    if (contracts.ZoomContract && state.wallet) {
      getZoomBalance();
    }
  }, [contracts.ZoomContract, state.wallet]);

  return (
    <Container>
      <NavigationSection>
        <NavItem color="white">
          <img src={marketplaceIcon} className="marketplace" />
          Live Auctions
        </NavItem>
      </NavigationSection>
      <UserBalances>
        <NavItem color={theme.colors.metamaskOrange}>
          <Tooltip
            title={<TooltipContent>{wallet}</TooltipContent>}
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
            title={<TooltipContent>Unknown</TooltipContent>}
            arrow
            placement="right"
          >
            <span>
              <img src={movrLogo} />
              Unknown
            </span>
          </Tooltip>
        </NavItem>
        <NavItem color="white">
          <Tooltip
            title={
              <TooltipContent>
                {zoomBalance.toLocaleString()} Zoom Tokens
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
