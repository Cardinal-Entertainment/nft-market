import zoomTokenLogo from './assets/zoombies_coin.svg'
import liveFeedIcon from './assets/live-feed.png'
import React, { useContext, useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import {
  Switch,
  Route,
  Redirect,
  NavLink,
  useLocation,
} from 'react-router-dom'
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
import { useQueryClient } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import {
  EVENT_TYPES,
  QUERY_KEYS,
  ZoombiesTestingEndpoint,
  ZoombiesStableEndpoint,
  NETWORK_NAMES,
  NETWORKS,
  homePageURL,
} from './constants'
import { useFetchProfileQuery } from './hooks/useProfile'
import { store } from 'store/store'
import NotificationAddon from './components/NotificationAddon'
import { setupEthers, setupEthListeners } from 'hooks/useBlockchain'
import { getNetworkNameFromURL } from 'utils/networkUtil'
import './assets/scss/App.scss'

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
    contracts: { ReadOnlyMarketContract },
  } = state

  const location = useLocation();

  useEffect(() => {
    const setupWallet = async () => {
      const chainName = location.pathname.replace('/', '')
      await setupEthers(dispatch, chainName)
      await setupEthListeners(dispatch)
    }
    setupWallet()
  }, [dispatch, location])

  const networkName = getNetworkNameFromURL()
  const chainId =
    networkName && networkName in NETWORKS
      ? NETWORKS[networkName].chainId
      : null

  const { data: myAuctions } = useFetchProfileQuery(address, chainId)

  useEffect(() => {
    const addLiveFeedItem = (liveFeedItem, filterKey, networkName) => {
      const liveFeeds = queryClient.getQueryData([
        QUERY_KEYS.liveFeeds,
        { filterKey },
      ])
      const uuid = uuidv4()
      const network = NETWORKS[networkName]

      const newItem = {
        _id: uuid,
        type: liveFeedItem.type,
        timestamp: Date.now() / 1000,
        content: {
          blockNumber: uuid, //should be removed when settle eventscraper is completed
          currency:
          network ?
            liveFeedItem.saleToken === network.zoomContractAddress
              ? 'ZOOM'
              : liveFeedItem.saleToken === network.wmovrContractAddress
              ? 'MOVR'
              : liveFeedItem.saleToken === network.usdtContractAddress
              ? 'USDT'
              : liveFeedItem.saleToken === network.daiContractAddress
              ? 'DAI'
              : '' : '',
          ...liveFeedItem,
        },
      }

      if (liveFeeds) {
        queryClient.setQueryData(
          [QUERY_KEYS.liveFeeds, { filterKey }],
          [newItem, ...liveFeeds]
        )
      } else {
        queryClient.setQueryData(
          [QUERY_KEYS.liveFeeds, { filterKey }],
          [newItem]
        )
      }

      const newCount = queryClient.getQueryData([
        QUERY_KEYS.liveFeeds,
        { filterKey: 'new' + filterKey },
      ])
      queryClient.setQueryData(
        [QUERY_KEYS.liveFeeds, { filterKey: 'new' + filterKey }],
        typeof newCount === 'string' ? parseInt(newCount) + 1 : newCount + 1
      )
    }

    const getBidType = (liveFeedItem) => {
      const condition = (bid) => {
        return bid.itemNumber === liveFeedItem.itemNumber
      }

      if (myAuctions.bids.some(condition)) {
        return 'myoutbid'
      }
      if (liveFeedItem.bidder === address) {
        return 'mybid'
      }
      if (myAuctions.listings.some(condition)) {
        return 'mybidon'
      }
      return 'bid'
    }

    const getSettleType = (liveFeedItem) => {
      const condition = (item) => {
        return item.itemNumber === liveFeedItem.itemNumber
      }

      if (myAuctions.bids.some(condition)) {
        return 'settlemybid'
      }
      if (liveFeedItem.winner === address) {
        return 'win'
      }
      if (
        myAuctions.listings.some(condition) ||
        liveFeedItem.seller === address
      ) {
        return 'sold'
      }
      return 'settle'
    }

    setIsMobileDrawerOpen(isDesktop)
    const tokenNewAuction = PubSub.subscribe(
      EVENT_TYPES.ItemListed,
      (msg, data) => {
        const newAuction = data
        let filterKey = ''

        if (newAuction.lister === address) {
          filterKey = 'MyAlerts'
          newAuction['type'] = 'mynew'
        } else {
          filterKey = 'General'
          newAuction['type'] = 'new'
        }

        addLiveFeedItem(newAuction, filterKey, newAuction.networkName)
      }
    )

    const tokenBid = PubSub.subscribe(EVENT_TYPES.Bid, async (msg, data) => {
      const bid = data
      let filterKey = ''

      const bidType = getBidType(bid)

      let listingItem = myAuctions.listings.find(
        (listing) => listing.itemNumber === bid.itemNumber
      )
      if (listingItem === undefined) {
        listingItem = await ReadOnlyMarketContract.getListItem(bid.itemNumber)
      }

      bid['type'] = bidType
      bid['saleToken'] = listingItem.saleToken
      if (bidType === 'bid') {
        filterKey = 'General'
      } else {
        filterKey = 'MyAlerts'
      }
      addLiveFeedItem(bid, filterKey, bid.networkName)
    })

    const tokenSettled = PubSub.subscribe(
      EVENT_TYPES.Settled,
      async (msg, data) => {
        const settleData = data
        let filterKey = ''

        const settleType = getSettleType(settleData)

        settleData['type'] = settleType
        if (settleType === 'settle') {
          filterKey = 'General'
        } else {
          filterKey = 'MyAlerts'
        }
        addLiveFeedItem(settleData, filterKey, settleData.networkName)
      }
    )

    return () => {
      PubSub.unsubscribe(tokenNewAuction)
      PubSub.unsubscribe(tokenBid)
      PubSub.unsubscribe(tokenSettled)
    }
  }, [queryClient, isDesktop, address, myAuctions, ReadOnlyMarketContract])

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

  return (
    <Container>
      <Header>
        <img alt="MOVR Token" src="https://zoombies.world/images/mr-icon.png" />
        <h1>Zoom </h1>{' '}
        <img
          src={zoomTokenLogo}
          className={'header-logo-zoom'}
          alt={'ZOOM token'}
          onClick={() => {
            if (chainId === 1287) {
              window.open(ZoombiesTestingEndpoint, '_blank')
            } else if (chainId === 1285) {
              window.open(ZoombiesStableEndpoint, '_blank')
            }
          }}
        />
        <h1>Market</h1>{' '}
        <span className="never-pay-commission">Never pay commission!</span>
        {isDesktop && (
          <div className="network-link-container">
            <NavLink
              exact
              activeClassName="active-network"
              to="/moonbase-alpha"
              className="network-links"
            >
              <div>Moonbase Alpha</div>
            </NavLink>
            <NavLink
              activeClassName="active-network"
              className="network-links"
              exact
              to="/moonriver"
            >
              <div>Moonriver</div>
            </NavLink>
            <NavLink
              activeClassName="active-network"
              className="network-links"
              exact
              to="moonbeam"
            >
              <div>Moonbeam</div>
            </NavLink>
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
