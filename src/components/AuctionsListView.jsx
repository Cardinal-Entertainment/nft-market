import React, {useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faClock } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import movrLogo from "../assets/movr_logo.png";
import zoomCoin from "../assets/zoombies_coin.svg";
import {Button, CircularProgress, Pagination, styled} from "@mui/material";
import LazyLoad from "react-lazyload";
import Card from "./Card";
import metamaskLogo from "../assets/metamask-face.png";
import {cardImageBaseURL} from "../constants";
import { useTheme } from "styled-components";
import AuctionItem from "./AuctionItem";

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto'
});

const AuctionsListView = ({
  auctions
}) => {

  const auctionItem = {
    _id	:	'617f68a2249fa49b459e6dec',
    itemNumber	:	10,
    auctionEnd	:	1635399447,
    tokenIds:		[5705],
    minPrice	:	1,
    highestBid	:	10.2032,
    lister	:	'0x9B9fc58A24F296D04D03921550C7fFc441aF34ba',
    saleToken	:	'0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316',
    nftToken	:	'0x3E7997B8D30AA6216102fb2e9206246e478d57d3',
    auctionStart	:	1635126210,
    cards: [

      {
        id	:	5705,
        name	:	'Green Eel',
        image	:	'https://zoombies.world/card-gen/assets/green_eel.svg',
        description	:	'This one glows in the dark.',
        itemNumber	:	0,
        typeId	:	108,
        cardSet	:	'Aquatic 1',
        zombieType	:	'Animal',
        cardOrigin	:	'Booster',
        rarity	:	'Common',
        editionCurrent	:	34,
        editionTotal	:	0,
        cardLevel	:	7,
        originalCost	:	0,
        earnCZXP	:	2,
        sacrificeCZXP	:	132,
        unlockCZXP	:	116,
        releaseTime	:	0,
      },
      {
        id	:	5706,
        name	:	'Green Eel',
        image	:	'https://zoombies.world/card-gen/assets/green_eel.svg',
        description	:	'This one glows in the dark.',
        itemNumber	:	0,
        typeId	:	108,
        cardSet	:	'Aquatic 1',
        zombieType	:	'Animal',
        cardOrigin	:	'Booster',
        rarity	:	'Common',
        editionCurrent	:	34,
        editionTotal	:	0,
        cardLevel	:	7,
        originalCost	:	0,
        earnCZXP	:	2,
        sacrificeCZXP	:	132,
        unlockCZXP	:	116,
        releaseTime	:	0,
      },
      {
        id	:	5707,
        name	:	'Green Eel',
        image	:	'https://zoombies.world/card-gen/assets/green_eel.svg',
        description	:	'This one glows in the dark.',
        itemNumber	:	0,
        typeId	:	108,
        cardSet	:	'Aquatic 1',
        zombieType	:	'Animal',
        cardOrigin	:	'Booster',
        rarity	:	'Common',
        editionCurrent	:	34,
        editionTotal	:	0,
        cardLevel	:	7,
        originalCost	:	0,
        earnCZXP	:	2,
        sacrificeCZXP	:	132,
        unlockCZXP	:	116,
        releaseTime	:	0,
      },
      {
        id	:	5708,
        name	:	'Green Eel',
        image	:	'https://zoombies.world/card-gen/assets/green_eel.svg',
        description	:	'This one glows in the dark.',
        itemNumber	:	0,
        typeId	:	108,
        cardSet	:	'Aquatic 1',
        zombieType	:	'Animal',
        cardOrigin	:	'Booster',
        rarity	:	'Common',
        editionCurrent	:	34,
        editionTotal	:	0,
        cardLevel	:	7,
        originalCost	:	0,
        earnCZXP	:	2,
        sacrificeCZXP	:	132,
        unlockCZXP	:	116,
        releaseTime	:	0,
      },
      {
        id	:	5709,
        name	:	'Green Eel',
        image	:	'https://zoombies.world/card-gen/assets/green_eel.svg',
        description	:	'This one glows in the dark.',
        itemNumber	:	0,
        typeId	:	108,
        cardSet	:	'Aquatic 1',
        zombieType	:	'Animal',
        cardOrigin	:	'Booster',
        rarity	:	'Common',
        editionCurrent	:	34,
        editionTotal	:	0,
        cardLevel	:	7,
        originalCost	:	0,
        earnCZXP	:	2,
        sacrificeCZXP	:	132,
        unlockCZXP	:	116,
        releaseTime	:	0,
      },
    ],
    highestBidder	:	'0x7D1Ac19FB6fA5aE02C088C5215733E45Fe2C6e3c'
  }

  // let auctions = []
  // auctions.push(auctionItem)


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
