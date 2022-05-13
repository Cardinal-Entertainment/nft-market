import React, { useContext, useState } from 'react'
import { useTheme } from 'styled-components'
import metamaskLogo from '../assets/metamask-face.png'
import Tooltip from '@mui/material/Tooltip'
import { store } from 'store/store'
import { NavLink } from 'react-router-dom'
import {
  faBell,
  faEdit,
  faQuestionCircle,
  faShoppingBag,
} from '@fortawesome/free-solid-svg-icons'

import { setupEthers, setupEthListeners } from '../hooks/useBlockchain'
import {
  addAssetToMetamask,
  formatAddress,
  isMetamaskInstalled,
} from '../utils/wallet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled as styled1 } from '@mui/material/styles'
import NotificationAddon from './NotificationAddon'
import { Button } from '@mui/material'
import { getNetworkNameFromURL } from '../utils/networkUtil'
import { CURRENCY_ICONS, NETWORK_ICONS } from '../constants'
import '../assets/scss/Navbar.scss'
import NetworkModal from './NetworkModal'

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

  '.connect-button': {
    display: 'flex',
    justifyContent: 'center',
    padding: '12px',

    button: {
      width: '100%',
    },
  },
})

const NavItemLiveFeeds = styled1('div')(({ theme }) => ({
  display: 'flex',
  flex: 'auto',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}))

const NavItem = styled1('div')(({ color }) => ({
  display: 'flex',
  alignItems: 'center',
  color: color,

  fontSize: '18px',
  height: '50px',
  position: 'relative',

  '#download-metamask': {
    width: '100%',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center',
  },

  ':hover': {
    color: '#03c1e8',
    cursor: 'pointer',
    backgroundColor: 'rgba(165, 160, 163, 0.2)',
    borderRadius: '5px',
  },

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
}))

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
})

const UserBalances = styled1('div')({
  padding: '5px',
  paddingTop: '10px',

  '& div': {
    justifyContent: 'space-between',
  },

  borderBottom: '1px solid white',
})

const TooltipContent = styled1('span')({
  fontSize: '16px',
})

const ButtonGroupContainer = styled1('div')({
  margin: '12px',

  '& a': {
    textDecoration: 'none',
  },

  '& .network-links > div': {
    paddingLeft: '8px',
  },

  '& .active-link > div': {
    backgroundColor: '#4a4a4a',
    borderRadius: '5px',
  },

  '& .popper': {
    width: '276px',

    '& .popper-menuitem div': {
      flex: 'auto',
    },
  },
})

const onConnect = async (dispatch, networkName) => {
  await setupEthers(dispatch, networkName)
  await setupEthListeners(dispatch)
}

const renderUserBalanceSection = (
  hasMetamask,
  dispatch,
  theme,
  shortWallet,
  address,
  balance,
  zoomBalance,
  usdtBalance,
  daiBalance,
  networkName
) => {
  if (!hasMetamask) {
    return (
      <NavItem color="white">
        <a
          id="download-metamask"
          href="https://metamask.io/download.html"
          target="_blank"
          rel="noreferrer"
        >
          Click here to install Metamask!
        </a>
      </NavItem>
    )
  }

  if (!address) {
    return (
      <div className="connect-button">
        <Button onClick={() => onConnect(dispatch, networkName)} variant="contained">
          Connect
        </Button>
      </div>
    )
  }

  return (
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
          title={<TooltipContent>{balance} MOVR</TooltipContent>}
          arrow
          placement="right"
        >
          <span>
            <img src={ CURRENCY_ICONS.MOVR} alt="movr logo" />
            {Number(balance).toFixed(4)} MOVR
          </span>
        </Tooltip>
      </NavItem>
      {/*<NavItem color="white">*/}
      {/*  <Tooltip*/}
      {/*    title={<TooltipContent>{usdtBalance} USDT</TooltipContent>}*/}
      {/*    arrow*/}
      {/*    placement="right"*/}
      {/*  >*/}
      {/*    <span>*/}
      {/*      <img src={usdtLogo} alt="usdt logo" />*/}
      {/*      {Number(usdtBalance).toFixed(4)} USDT*/}
      {/*    </span>*/}
      {/*  </Tooltip>*/}
      {/*</NavItem>*/}
      <NavItem color="white">
        <Tooltip
          title={
            <TooltipContent>
              {zoomBalance?.toLocaleString()} ZOOM Tokens
            </TooltipContent>
          }
          arrow
          placement="right"
        >
          <span>
            <img className="zoom" src={CURRENCY_ICONS.ZOOM} alt="zoom coin logo" />
            {Number(Number(zoomBalance || 0).toFixed(4)).toLocaleString()} ZOOM
          </span>
        </Tooltip>
      </NavItem>
    </UserBalances>
  )
}

const Navbar = ({ toggleLiveFeeds, hideNavbar, isMobile }) => {
  const theme = useTheme()

  const { state, dispatch } = useContext(store)
  const {
    wallet: { address, balance, zoomBalance, daiBalance },
    contracts,
  } = state

  const shortWallet = formatAddress(address)
  const isExtensionInstalled = isMetamaskInstalled()

  const networkName = getNetworkNameFromURL()

  const networkIconUrl = NETWORK_ICONS[networkName]

  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const handleOpen = () => setIsNetworkModalOpen(true)
  const handleClose = () => setIsNetworkModalOpen(false)

  return (
    <Container>
      <NavigationSection>
        <NavLink exact to={`/${networkName}`} activeClassName="active-link">
          <NavItem color="white" onClick={hideNavbar}>
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="lg"
              className="marketplace"
            />
            Live Auctions
          </NavItem>
        </NavLink>
        <NavLink exact activeClassName="active-link" to={`/${networkName}/new`}>
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
              to={`/${networkName}/profile`}
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
              to={`/${networkName}/archives`}
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
      {renderUserBalanceSection(
        isExtensionInstalled,
        dispatch,
        theme,
        shortWallet,
        address,
        balance,
        zoomBalance,
        daiBalance,
        networkName
      )}
      <ButtonGroupContainer>
        <NavItemLiveFeeds>
          <NavItem
            color="white"
            style={{ flex: 'auto' }}
            onClick={() => {
              toggleLiveFeeds()
              hideNavbar()
            }}
          >
            <FontAwesomeIcon className="marketplace" icon={faBell} size="lg" />
            <NotificationAddon clickAction={toggleLiveFeeds} />
            Live Feeds
          </NavItem>
        </NavItemLiveFeeds>

        <NavLink
          exact
          activeClassName="active-link"
          to={`/${networkName}/help`}
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
        {isMobile && (
          <>
            <button onClick={handleOpen} className="network-button-mobile">
              <img
                src={networkIconUrl}
                alt="network-logo"
                className="mobile-network-icon"
              ></img>
              <p>Switch network</p>
            </button>
            <NetworkModal
              isNetworkModalOpen={isNetworkModalOpen}
              handleClose={handleClose}
            ></NetworkModal>
          </>
        )}
        <Button
          onClick={() => {
            addAssetToMetamask('ZOOM', contracts.ZoomContract.address)
          }}
          aria-controls="basic-menu"
          aria-haspopup="true"
          variant="contained"
          style={{
            width: '100%',
            height: '40px',
            flex: 'auto',
          }}
        >
          Add ZOOM to Metamask
        </Button>
      </ButtonGroupContainer>
    </Container>
  )
}

export default Navbar
