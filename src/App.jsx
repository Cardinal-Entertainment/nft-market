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
  const { dispatch, state } = useContext(store);
  const isDesktop = useMediaQuery('(min-width:1024px)');

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

  useEffect(() => {
    setShowMenu(isDesktop)
  }, [ isDesktop ]);

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
                  <Navbar toggleLiveFeeds={showSlider} hideNavbar={hideNavbar}/>
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
              <Route path="/" component={Home} />
            </Switch>
          </Content>
          { checked && (
            <Slide direction="left" in={checked} mountOnEnter unmountOnExit>
              <LiveFeedsSlide hideLiveFeeds={() => setChecked(false)}/>
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
