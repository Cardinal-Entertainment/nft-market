import styled from "styled-components";
import DialogSource from "@mui/material/Dialog";
import useBlockchain from "./hooks/useBlockchain";
import zoombiesLogo from "./assets/zoombies_head.svg";
import React from "react";
import Navbar from "components/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "pages/Home";
import NewListing from "pages/NewListing";

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
`;

const Footer = styled.div`
  height: 0px;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Content = styled.div`
  flex: 1;
  background: linear-gradient(180deg, #f566e2 0%, #b131fe 100%);
  padding: 20px;
`;

const App = () => {
  const {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  } = useBlockchain();

  return (
    <Container>
      <Router>
        <Header>
          <img src={zoombiesLogo} />
          <h1>ZOOMBIES Auction</h1>
        </Header>
        <Body>
          <Navbar />
          <Content>
            <Switch>
              <Route path="/new">
                <NewListing />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Content>
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
