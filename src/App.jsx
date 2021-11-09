import styled from "styled-components";
import DialogSource from "@mui/material/Dialog";
import useBlockchain from "./hooks/useBlockchain";
import zoombiesLogo from "./assets/zoombies_head.svg";
import liveFeedIcon from './assets/live-feed.png';
import React, {useContext} from "react";
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
import HelpPage from "./pages/Help";

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Dialog = styled(DialogSource)`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
`;

const Header = styled.div`
  height: 75px;
  background: #301748;
  display: flex;
  align-items: center;

  font-weight: 500;
  font-size: 16px;
  color: white;

  img {
    width: 60px;
    margin: 0 10px;
  }
  
  .btn-livefeed {
    width: 48px;
    height: 48px;
    margin-left: auto;
    margin-right: 32px;
  }
   
`;

const Footer = styled.div`
  height: 0px;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  background: linear-gradient(180deg, #f566e2 0%, #b131fe 100%);
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  
  padding: 20px;
`;

const NotificationButton = styled.div`
  position: relative;
  display: flex;
  flex: auto;
`;

const ButtonAddon = styled.div`
  position: absolute;
  top: 0;
  right: 8px;
  
  padding: 0 4px;
  height: 24px;
  min-width: 16px;
  color: white;
  background-color: #f00;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;


const App = () => {
  const {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  } = useBlockchain();

  const [checked, setChecked] = React.useState(false);
  const { dispatch, state } = useContext(store);


  const showSlider = () => {
    if (checked) {
      dispatch (Actions.resetNotifications(false))
    }
    setChecked(!checked)
  };

  const NotificationButtonComponent = () => {
    return (
      <NotificationButton>
        <Button onClick={showSlider} className={'btn-livefeed'}><img src={liveFeedIcon} alt={"Live Feed"}/>
          {
            state.newEventsCount > 0 && (
              <ButtonAddon>
                {
                  state.newEventsCount >= 100 ? '99+' : state.newEventsCount
                }
              </ButtonAddon>
            )
          }
        </Button>
      </NotificationButton>
    )
  }
  return (
    <Container>
      <Router>
        <Header>
          <img src={zoombiesLogo} alt={"ZOOM"}/>
          <h1>Zoombies Market</h1>
          <NotificationButtonComponent/>
        </Header>
        <Body>

          <Navbar />
          <Content>
            <Switch>
              <Route path="/new" component={NewListing} />
              <Route path="/listing/:id" component={ViewListing} />
              <Route path="/help" component={HelpPage} />
              <Route path="/" component={Home} />
            </Switch>
          </Content>
          { checked && (
            <Slide direction="left" in={checked} mountOnEnter unmountOnExit>
              <LiveFeedsSlide/>
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
