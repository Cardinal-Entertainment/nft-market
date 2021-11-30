import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import metamaskLogo from '../assets/metamask-face.png';
import movrLogo from '../assets/movr_logo.png';
import zoomCoin from '../assets/zoombies_coin.svg';
import Tooltip from '@mui/material/Tooltip';
import { store } from 'store/store';
import { NavLink } from 'react-router-dom';
import {
  faBell,
  faEdit,
  faQuestionCircle,
  faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';

import {
  formatAddress,
  getWalletWMOVRBalance,
  getWalletZoomBalance,
} from '../utils/wallet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled as styled1 } from '@mui/material/styles';
import NotificationAddon from './NotificationAddon';
import WrapMovrMenu from './WrapMovrMenu';

const Container = styled1('div')({
  width: '300px',
  background: 'rgba(11, 11, 11, 0.87)',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  zIndex: 1,

  '& .dropdown-buttons': {
    margin: '10px 0',

    '& .select': {
      color: 'white',
      backgroundColor: '#1976d2',
    },
  },
});

const NavItemLiveFeeds = styled1('div')(({ theme }) => ({
  display: 'flex',
  flex: 'auto',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const NavItem = styled1('div')(({ color }) => ({
  display: 'flex',
  alignItems: 'center',
  color: color,

  fontSize: '18px',
  height: '50px',
  position: 'relative',

  '& span': {
    display: 'flex',
    alignItems: 'center',
  },

  '& img': {
    width: '50px',
    marginRight: '17px',
  },

  '& img.zoom': {
    width: '40px',
    padding: '0 5px',
  },

  '& svg': {
    padding: '0 15px 0 5px',

    '&.marketplace': {
      paddingRight: '22px',
      width: '40px',
    },
  },
}));

const NavigationSection = styled1('div')({
  flex: 1,
  padding: '15px 5px 5px 5px',

  '& a': {
    textDecoration: 'none',
  },

  '& .active-link > div': {
    backgroundColor: '#4a4a4a',
    borderRadius: '5px',
  },

  '& NavItem': {
    fontSize: '20px',
  },

  '& NavItem:hover': {
    color: '#03c1e8',
    cursor: 'pointer',
  },
});

const UserBalances = styled1('div')({
  padding: '5px',
  paddingTop: '10px',

  '& div': {
    justifyContent: 'space-between',
  },

  borderBottom: '1px solid white',
});

const TooltipContent = styled1('span')({
  fontSize: '16px',
});

const ButtonGroupContainer = styled1('div')({
  margin: '12px',

  '& .popper': {
    width: '276px',

    '& .popper-menuitem div': {
      flex: 'auto',
    },
  },
});

const Navbar = ({ toggleLiveFeeds, hideNavbar }) => {
  const theme = useTheme();
  const { state } = useContext(store);
  const {
    wallet: { address, balance },
    contracts,
  } = state;

  const [zoomBalance, setZoomBalance] = useState('');
  const [WMOVRBalance, setWMOVRBalance] = useState('');

  const shortWallet = formatAddress(address);

  useEffect(() => {
    const getZoomBalance = async () => {
      const bal = await getWalletZoomBalance(contracts.ZoomContract, address);
      setZoomBalance(bal);
    };

    const getWMOVRBalance = async () => {
      const bal = await getWalletWMOVRBalance(contracts.WMOVRContract, address);
      setWMOVRBalance(bal);
    };

    if (contracts.ZoomContract && address) {
      getZoomBalance();
      contracts.ZoomContract.provider.on('block', () => {
        getZoomBalance();
      });
    }
    if (contracts.WMOVRContract && address) {
      getWMOVRBalance();

      contracts.WMOVRContract.provider.on('block', () => {
        getWMOVRBalance();
      });
    }
  }, [contracts, address]);

  return (
    <Container>
      <NavigationSection>
        <NavLink
          exact
          to="/"
          activeClassName="active-link"
          className="page-links"
        >
          <NavItem color="white" onClick={hideNavbar}>
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="lg"
              className="marketplace"
            />
            Live Auctions
          </NavItem>
        </NavLink>
        <NavLink
          exact
          activeClassName="active-link"
          className="page-links"
          to="/new"
        >
          <NavItem color="white" onClick={hideNavbar}>
            <FontAwesomeIcon className="marketplace" icon={faEdit} size="lg" />
            New Listing
          </NavItem>
        </NavLink>
        {address && (
          <>
            <NavLink
              exact
              activeClassName="active-link"
              className="page-links"
              to="/profile"
            >
              <NavItem color="white" onClick={hideNavbar}>
                <Tooltip
                  title={<TooltipContent>User Profile</TooltipContent>}
                  arrow
                  placement="right"
                >
                  <span>
                    <img src={metamaskLogo} alt="metamask logo" />
                    Profile
                  </span>
                </Tooltip>
              </NavItem>
            </NavLink>
            <NavLink
              exact
              activeClassName="active-link"
              className="page-links"
              to="/archives"
            >
              <NavItem color="white" onClick={hideNavbar}>
                <Tooltip
                  title={<TooltipContent>Auctions Archive</TooltipContent>}
                  arrow
                  placement="right"
                >
                  <span>
                    <img src={metamaskLogo} alt="metamask logo" />
                    Auction Archive
                  </span>
                </Tooltip>
              </NavItem>
            </NavLink>
          </>
        )}
      </NavigationSection>
      <UserBalances>
        <NavItem color={theme.colors.metamaskOrange}>
          <Tooltip
            title={<TooltipContent>{address}</TooltipContent>}
            arrow
            placement="right"
          >
            <span>
              <img src={metamaskLogo} alt="metamask logo" />
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
              <img src={movrLogo} alt="movr logo" />
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
              <img src={movrLogo} alt="movr logo" />
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
              <img className="zoom" src={zoomCoin} alt="zoom coin logo" />
              {Number(Number(zoomBalance).toFixed(4)).toLocaleString()} ZOOM
            </span>
          </Tooltip>
        </NavItem>
      </UserBalances>
      <ButtonGroupContainer>
        <NavItemLiveFeeds>
          <NavItem
            color="white"
            style={{ flex: 'auto' }}
            onClick={toggleLiveFeeds}
          >
            <FontAwesomeIcon className="marketplace" icon={faBell} size="lg" />
            <NotificationAddon clickAction={toggleLiveFeeds} />
            Live Feeds
          </NavItem>
        </NavItemLiveFeeds>

        <NavLink
          exact
          activeClassName="active-link"
          className="page-links"
          to="/help"
        >
          <NavItem color="white" onClick={hideNavbar}>
            <FontAwesomeIcon
              className="marketplace"
              icon={faQuestionCircle}
              size="lg"
            />
            Help
          </NavItem>
        </NavLink>
        <WrapMovrMenu></WrapMovrMenu>
      </ButtonGroupContainer>
    </Container>
  );
};

export default Navbar;
