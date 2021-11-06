import React from "react";
import { CircularProgress, styled} from "@mui/material";
import LazyLoad from "react-lazyload";
import AuctionItem from "./AuctionItem";

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
});

const AuctionsListView = ({
  auctions
}) => {
  return (
    <Container>
      {auctions ?
        auctions.map((auction, index) => (
          <LazyLoad key={index} once={true} resize={true}>
            <AuctionItem content={auction}/>
          </LazyLoad>
        )) : <CircularProgress/>}
    </Container>
  );
};

export default AuctionsListView;
