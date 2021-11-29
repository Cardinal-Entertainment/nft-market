import DialogSource from "@mui/material/Dialog";
import useBlockchain from "./hooks/useBlockchain";
import zoombiesLogo from "./assets/zoombies_head.svg";
import liveFeedIcon from './assets/live-feed.png';
import React, {useContext, useEffect} from "react";
import Navbar from "components/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "pages/Home";
import NewListing from "pages/NewListing";
import ViewListing from "pages/ViewListing";
import {Button} from "@mui/material";
import Slide from "@mui/material/Slide";
import LiveFeedsSlide from "./components/LiveFeedsSlide";
import {store} from "./store/store";
import Actions from "./store/actions";
import { styled, useMediaQuery } from '@mui/material';
import {faBars, faTimes} from "@fortawesome/free-solid-svg-icons";

import HelpPage from "./pages/Help";
import Profile from 'pages/Profile';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NotificationAddon from "./components/NotificationAddon";
import AuctionArchive from "pages/AuctionArchive";
import watchMarketEvents from "utils/setupWatcher";
import PubSub from 'pubsub-js';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import {EVENT_TYPES, marketContractAddress, QUERY_KEYS, wmovrContractAddress, zoomContractAddress} from './constants';
import {ethers} from "ethers";
import moment from "moment";
import {useFetchLiveFeeds} from "./hooks/useLiveFeeds";
import {useFetchProfileQuery} from "./hooks/useProfile";

const Container = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const Dialog = styled(DialogSource)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '500px'
})

const Logo = styled('img')({
  width: '40px',
  height: '40px'
})

const Header = styled('div')({
  height: '75px',
  background: '#301748',
  display: 'flex',
  alignItems: 'center',

  fontWeight: '500',
  fontSize: '16px',
  color: 'white',

  '& img': {
    width: '60px',
    margin: '0 10px'
  },

  '& .btn-livefeed': {
    width: '48px',
    height: '48px',
    marginLeft: 'auto',
    marginRight: '32px'
  }
})

const Footer = styled('div')({
  height: '0px'
})

const Body = styled('div')({
  flex: 1,
  display: 'flex',
  minHeight: 0,
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',
  position: 'relative'
})

const Content = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,

  padding: '16px 8px 16px 16px',
  display: 'flex',
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',

  [theme.breakpoints.down('md')]: {
    padding: '8px',
  },
}))

const NotificationButton = styled('div')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('lg')]: {
    position: 'relative',
    display: 'flex',
    flex: 'auto'
  },
}))

const HamburgerMenuButton = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flex: 'auto',
  justifyContent: 'flex-end',
  padding: '16px',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}))

const NavbarContainer = styled('div')(({ theme }) => ({

  position: 'absolute',
  left: 0,
  display: 'flex',
  zIndex: 2,
  height: '100%',

  [theme.breakpoints.up('lg')]: {
    display: 'flex',
    position: 'relative',
    left: 'unset',
    zIndex: 1,
  },
}))

const App = () => {
  const {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  } = useBlockchain();

  const [checked, setChecked] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const { dispatch } = useContext(store);
  const isDesktop = useMediaQuery('(min-width:1024px)');

  const queryClient = useQueryClient();

  const showSlider = () => {
    if (checked) {
      dispatch (Actions.resetNotifications(false))
    }
    setChecked(!checked)
    if (!isDesktop) {
      setShowMenu(false)
    }
  };

  const hideNavbar = () => {

    if (!isDesktop) {
      setShowMenu(false)
      setChecked(false)
    }
  }

  const { state } = useContext(store);
  const {
    wallet: { address },
    contracts: { MarketContract }
  } = state;


  const { isLoading, data: myAuctions } = useFetchProfileQuery(address);

  const addLiveFeedItem = ( liveFeedItem, filterKey ) => {
    const liveFeeds = queryClient.getQueryData([QUERY_KEYS.liveFeeds, { filterKey }])
    const uuid = uuidv4()

    const newItem = {
      _id: uuid,
      type: liveFeedItem.type,
      timestamp: Date.now() / 1000,
      content: {
        blockNumber: uuid, //should be removed when settle eventscraper is completed
        currency: liveFeedItem.saleToken === zoomContractAddress ? 'ZOOM' : liveFeedItem.saleToken === wmovrContractAddress ? 'WMOVR' : '',
        ...liveFeedItem,
      }
    }

    if (liveFeeds) {
      queryClient.setQueryData([QUERY_KEYS.liveFeeds, { filterKey }], [newItem, ...liveFeeds])
    } else {
      queryClient.setQueryData([QUERY_KEYS.liveFeeds, { filterKey }], [newItem])
    }

    const newCount = queryClient.getQueryData([QUERY_KEYS.liveFeeds, { filterKey: "new" + filterKey }])
    queryClient.setQueryData([QUERY_KEYS.liveFeeds, { filterKey: "new" + filterKey }], typeof(newCount) === 'string' ? parseInt(newCount) + 1 : newCount + 1)
  }

  const getBidType = ( liveFeedItem ) => {

    const condition = ( bid ) => {
      return bid.itemNumber === liveFeedItem.itemNumber
    }

    if (myAuctions.bids.some(condition)) {
      return "myoutbid"
    }
    if (myAuctions.listings.some(condition)) {
      if (liveFeedItem.bidder === address) {
        return "mybid"
      } else {
        return "mybidon"
      }
    }
    return "bid"
  }

  useEffect(() => {
    setShowMenu(isDesktop)
    const tokenNewAuction = PubSub.subscribe(EVENT_TYPES.ItemListed, (msg, data) => {
      const newAuction = data
      let filterKey = ""

      if (newAuction.lister === address) {
        filterKey = "MyAlerts"
        newAuction["type"] = "mynew"
      } else {
        filterKey = "General"
        newAuction["type"] = "new"
      }

      addLiveFeedItem(newAuction, filterKey)
    })

    const tokenBid = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
      const bid = data
      let filterKey = ""

      const bidType = getBidType(bid)
      let listingItem = myAuctions.listings.find( ( listing ) => listing.itemNumber == bid.itemNumber)
      if (listingItem === undefined) {
        listingItem = MarketContract.getListItem(bid.itemNumber)
      }

      bid["type"] = bidType
      bid["saleToken"] = listingItem.saleToken
      if (bidType === "bid") {
        filterKey = "General"
      } else {
        filterKey = "MyAlerts"
      }
      addLiveFeedItem(bid, filterKey)
    })

    return () => {
      PubSub.unsubscribe(tokenNewAuction);
      PubSub.unsubscribe(tokenBid);
    }
  }, [ queryClient, isDesktop, address, myAuctions, MarketContract ]);


  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }
  

  const NotificationButtonComponent = () => {
    return (
      <NotificationButton>
        <Button onClick={showSlider} className={'btn-livefeed'}><img src={liveFeedIcon} alt={"Live Feed"}/>
        <NotificationAddon clickAction={showSlider}/>
        </Button>
      </NotificationButton>
    )
  }

  const ToggleMenu = () => {
    return (
      <HamburgerMenuButton>
        {
          showMenu ?
            <FontAwesomeIcon icon={faTimes} size="lg" onClick={toggleMenu}/> :
            <FontAwesomeIcon icon={faBars} size="lg" onClick={toggleMenu}/>
        }
        <NotificationAddon clickAction={toggleMenu}/>
      </HamburgerMenuButton>
    )
  }

  return (
    <Container>
      <Router>
        <Header>
          <img src={zoombiesLogo} alt={"ZOOM"}/>
          <h1>Zoombies Market</h1>
          <NotificationButtonComponent/>
          <ToggleMenu/>
        </Header>
        <Body>
          {
            showMenu && (
              <Slide direction="right" in={showMenu} mountOnEnter unmountOnExit>
                <NavbarContainer>
                  <Navbar togglelivefeeds={() => showSlider()} hidenavbar={() => hideNavbar()}/>
                </NavbarContainer>
              </Slide>
            )
          }

          <Content>
            <Switch>
              <Route path="/new" component={NewListing} />
              <Route path="/listing/:id" component={ViewListing} />
              <Route path="/help" component={HelpPage} />
              <Route path="/profile" component={Profile} />
              <Route path="/archives" component={AuctionArchive} />
              <Route path="/" component={Home} />
            </Switch>
          </Content>
          { checked && (
            <Slide direction="left" in={checked} mountOnEnter unmountOnExit>
              <LiveFeedsSlide hidelivefeeds={() => setChecked(false)}/>
            </Slide>) }
        </Body>
        <Footer />
        <Dialog
          open={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
        >
          <Logo
            src={"https://cryptoz.cards/assets/cryptokeeper_logo_binance.png"}
          />
        </Dialog>
      </Router>
    </Container>
  );
};

export default App;
