import zoomTokenLogo from './assets/zoombies_coin.svg'
import liveFeedIcon from './assets/live-feed.png'
import React, { useContext, useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import Home from 'pages/Home'
import NewListing from 'pages/NewListing'
import ViewListing from 'pages/ViewListing'
import { Button, Drawer, Slide } from '@mui/material'
import LiveFeedsSlide from './components/LiveFeedsSlide'
import { styled, useMediaQuery } from '@mui/material'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'

import HelpPage from './pages/Help'
import Profile from 'pages/Profile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AuctionArchive from 'pages/AuctionArchive'
import PubSub from 'pubsub-js'
import { QueryCache, useQueryClient } from 'react-query'
import {
  ZoombiesTestingEndpoint,
  ZoombiesStableEndpoint,
  NETWORK_NAMES,
  NETWORKS,
  NETWORK_ICONS,
} from './constants'
import { useFetchProfileQuery } from './hooks/useProfile'
import { store } from 'store/store'
import NotificationAddon from './components/NotificationAddon'
import { setupEthers } from 'hooks/useBlockchain'
import { getNetworkNameFromURL } from 'utils/networkUtil'
import './assets/scss/App.scss'
import NetworkModal from 'components/NetworkModal'
import { addBidEventToFeed, newItemListedEvent, newSettledEvent } from 'utils/events'

const Container = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

const Header = styled('div')(({ theme }) => ({
  height: '75px',
  background: '#301748',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,

  fontSize: '16px',
  color: 'white',

  '& img': {
    width: '60px',
    margin: '0 10px',
  },

  '& .btn-livefeed': {
    width: '48px',
    height: '48px',
    marginLeft: 'auto',
    marginRight: '32px',
  },

  '& h1': {
    display: 'block',
    width: '300px',
  },

  [theme.breakpoints.down('md')]: {
    '& img': {
      width: '40px',
    },
  },

  [theme.breakpoints.down('sm')]: {
    '& img': {
      width: '25px',
    },
  },

  '& .header-logo-zoom': {
    cursor: 'pointer',
  },
}))

const Footer = styled('div')({
  height: '0px',
})

const Body = styled('div')({
  flex: 1,
  display: 'flex',
  minHeight: 0,
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',
  position: 'relative',

  '& .permanent-drawer': {
    position: 'relative',
  },
})

const Content = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,

  display: 'flex',
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',

  [theme.breakpoints.down('md')]: {
    padding: '8px',
  },
}))

const HamburgerMenuButton = styled('div')(() => ({
  position: 'relative',
  display: 'flex',
  flex: 'auto',
  justifyContent: 'flex-end',
  padding: '16px',
}))

const NavbarContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
}))

const App = () => {
  const isDesktop = useMediaQuery('(min-width:1024px)')
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const { dispatch } = useContext(store)

  const queryClient = useQueryClient()

  const { state } = useContext(store)
  const {
    wallet: { address },
    isInitialSetupDone,
  } = state

  const location = useLocation()

  const networkName = getNetworkNameFromURL()
  const chainId =
    networkName && networkName in NETWORKS
      ? NETWORKS[networkName].chainId
      : null

  const networkIconUrl = NETWORK_ICONS[networkName]

  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const handleOpen = () => setIsNetworkModalOpen(true)
  const handleClose = () => setIsNetworkModalOpen(false)

  useEffect(() => {
    const setupWallet = async () => {
      if (!isInitialSetupDone) {
        const chainName = location.pathname.replace('/', '')
        setIsNetworkModalOpen(false)
        const queryCache = new QueryCache()
        queryCache.clear()
        await setupEthers(dispatch, queryClient, chainName)
      }
    }
    setupWallet()
  }, [dispatch, location, isInitialSetupDone, queryClient])

  useEffect(() => {
    const token = newItemListedEvent(queryClient, null, chainId, address)

    return () => {
      PubSub.unsubscribe(token)
    }
  }, [queryClient, chainId, address])

  const { data: myAuctions } = useFetchProfileQuery(address, chainId)

  useEffect(() => {
    setIsMobileDrawerOpen(isDesktop)

    const bidToken = addBidEventToFeed(
      queryClient, address, chainId
    )

    const tokenSettled = newSettledEvent(queryClient, address, chainId)

    return () => {
      PubSub.unsubscribe(bidToken)
      PubSub.unsubscribe(tokenSettled)
    }
  }, [
    queryClient,
    isDesktop,
    address,
    myAuctions,
    chainId,
  ])

  const LiveFeedButton = () => {
    return (
      <Button
        onClick={() => setIsLiveFeedOpen((prevState) => !prevState)}
        className={'btn-livefeed'}
      >
        <img src={liveFeedIcon} alt={'Live Feed'} />
        <NotificationAddon
          onClick={() => setIsLiveFeedOpen((prevState) => !prevState)}
        />
      </Button>
    )
  }

  const MobileHamburgerMenu = () => {
    return (
      <HamburgerMenuButton>
        {isMobileDrawerOpen ? (
          <>
            <FontAwesomeIcon
              icon={faTimes}
              size="lg"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <NotificationAddon onClick={() => setIsMobileDrawerOpen(false)} />
          </>
        ) : (
          <>
            <FontAwesomeIcon
              icon={faBars}
              size="lg"
              onClick={() => setIsMobileDrawerOpen(true)}
            />
            <NotificationAddon onClick={() => setIsMobileDrawerOpen(true)} />
          </>
        )}
        <NotificationAddon />
      </HamburgerMenuButton>
    )
  }

  const supportedNetworkRegex = Object.keys(NETWORK_NAMES)
    .map((network) => NETWORK_NAMES[network])
    .join('|')

  const zoombiesLogoUrl = chainId === 1285 ? ZoombiesStableEndpoint : ZoombiesTestingEndpoint

  return (
    <Container>
      <Header>
        <a href={zoombiesLogoUrl} target="_blank" rel="noreferrer">
          <img
            src={zoomTokenLogo}
            className={'header-logo-zoom'}
            alt={'ZOOM token'}
          />
        </a>
        <h1>Zoom Market</h1>
        <span className="never-pay-commission">Never pay commission!</span>
        {isDesktop && (
          <div className="network-link-container">
            <button onClick={handleOpen}>
              <img src={networkIconUrl} alt="network-logo"></img>
            </button>
            <NetworkModal
              isNetworkModalOpen={isNetworkModalOpen}
              handleClose={handleClose}
            ></NetworkModal>
          </div>
        )}
        {isDesktop ? <LiveFeedButton /> : <MobileHamburgerMenu />}
      </Header>
      <Body>
        <Drawer
          classes={{
            paper: 'permanent-drawer',
          }}
          open={isMobileDrawerOpen}
          variant={isDesktop ? 'permanent' : 'temporary'}
          onClose={() => setIsMobileDrawerOpen(false)}
        >
          <NavbarContainer>
            <Navbar
              toggleLiveFeeds={() => setIsLiveFeedOpen(true)}
              hideNavbar={() => setIsMobileDrawerOpen(false)}
              isMobile={!isDesktop}
            />
          </NavbarContainer>
        </Drawer>
        <Content>
          <Switch>
            <Route
              path={`/:network(${supportedNetworkRegex})/new`}
              component={NewListing}
            />
            <Route
              path={`/:network(${supportedNetworkRegex})/listing/:id`}
              component={ViewListing}
            />
            <Route
              path={`/:network(${supportedNetworkRegex})/help`}
              component={HelpPage}
            />
            <Route
              path={`/:network(${supportedNetworkRegex})/profile`}
              component={Profile}
            />
            <Route
              path={`/:network(${supportedNetworkRegex})/archives`}
              component={AuctionArchive}
            />
            <Route
              path={`/:network(${supportedNetworkRegex})/`}
              component={Home}
            />
            <Route exact path="/">
              <Redirect to="/moonbase-alpha" />
            </Route>
            <Route path="*">
              <h2
                style={{
                  color: 'white',
                  marginLeft: '12px',
                }}
              >
                Please select a valid network
              </h2>
            </Route>
          </Switch>
        </Content>
        {isLiveFeedOpen && (
          <Slide
            direction="left"
            in={isLiveFeedOpen}
            mountOnEnter
            unmountOnExit
          >
            <LiveFeedsSlide hidelivefeeds={() => setIsLiveFeedOpen(false)} />
          </Slide>
        )}
      </Body>
      <Footer />
    </Container>
  )
}

export default App
