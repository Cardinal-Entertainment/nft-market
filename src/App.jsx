import DialogSource from '@mui/material/Dialog';
import useBlockchain from './hooks/useBlockchain';
import zoombiesLogo from './assets/zoombies_head.svg';
import liveFeedIcon from './assets/live-feed.png';
import React, { useState } from 'react';
import Navbar from 'components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from 'pages/Home';
import NewListing from 'pages/NewListing';
import ViewListing from 'pages/ViewListing';
import { Button, Drawer } from '@mui/material';
import LiveFeedsSlide from './components/LiveFeedsSlide';
import { styled, useMediaQuery } from '@mui/material';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

import HelpPage from './pages/Help';
import Profile from 'pages/Profile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AuctionArchive from 'pages/AuctionArchive';

const Container = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const Dialog = styled(DialogSource)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '500px',
});

const Logo = styled('img')({
  width: '40px',
  height: '40px',
});

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
    margin: '0 10px',
  },

  '& .btn-livefeed': {
    width: '48px',
    height: '48px',
    marginLeft: 'auto',
    marginRight: '32px',
  },
});

const Footer = styled('div')({
  height: '0px',
});

const Body = styled('div')({
  flex: 1,
  display: 'flex',
  minHeight: 0,
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',
  position: 'relative',

  '& .permanent-drawer': {
    position: 'relative',
  },
});

const Content = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,

  padding: '16px 8px 16px 16px',
  display: 'flex',
  background: 'linear-gradient(110.99deg, #000033 0%, #100238 100%)',

  [theme.breakpoints.down('md')]: {
    padding: '8px',
  },
}));

const HamburgerMenuButton = styled('div')(() => ({
  position: 'relative',
  display: 'flex',
  flex: 'auto',
  justifyContent: 'flex-end',
  padding: '16px',
}));

const NavbarContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
}));

const App = () => {
  const {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  } = useBlockchain();

  const isDesktop = useMediaQuery('(min-width:1024px)');
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const LiveFeedButton = () => {
    return (
      <Button
        onClick={() => setIsLiveFeedOpen(true)}
        className={'btn-livefeed'}
      >
        <img src={liveFeedIcon} alt={'Live Feed'} />
      </Button>
    );
  };

  const MobileHamburgerMenu = () => {
    return (
      <HamburgerMenuButton>
        {isMobileDrawerOpen ? (
          <FontAwesomeIcon
            icon={faTimes}
            size="lg"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        ) : (
          <FontAwesomeIcon
            icon={faBars}
            size="lg"
            onClick={() => setIsMobileDrawerOpen(true)}
          />
        )}
      </HamburgerMenuButton>
    );
  };

  return (
    <Container>
      <Router>
        <Header>
          <img src={zoombiesLogo} alt={'ZOOM'} />
          <h1>Zoombies Market</h1>
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
              />
            </NavbarContainer>
          </Drawer>
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
          <Drawer
            anchor="right"
            open={isLiveFeedOpen}
            onClose={() => setIsLiveFeedOpen(false)}
          >
            <LiveFeedsSlide hideLiveFeeds={() => setIsLiveFeedOpen(false)} />
          </Drawer>
        </Body>
        <Footer />
        <Dialog
          open={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
        >
          <Logo
            src={'https://cryptoz.cards/assets/cryptokeeper_logo_binance.png'}
          />
        </Dialog>
      </Router>
    </Container>
  );
};

export default App;
