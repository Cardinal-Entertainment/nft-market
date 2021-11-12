import React, {useContext, useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faClock } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import movrLogo from "../assets/movr_logo.png";
import zoomCoin from "../assets/zoombies_coin.svg";
import {Button, CircularProgress, styled} from "@mui/material";
import {cardImageBaseURL, marketContractAddress, wmovrContractAddress, zoomContractAddress} from "../constants";
import { useTheme } from "styled-components";
import moment from "moment";
import {useHistory} from "react-router-dom";
import {store} from "../store/store";
import { ethers } from "ethers";
import {getOffers as fetchOffers} from "../utils/auction";
import OfferDialog from "./OfferDialog";

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',

  background: '#5A5A5A',
  border: '1px solid #FFFFFF',
  boxSizing: 'border-box',
  borderRadius: '4px',
  flex: 'none',
  alignSelf: 'stretch',
  flexGrow: 0,
  margin: '12px 0px',
  // height: '296px',

  '& .meta-header-cards-tip': {
    fontSize: '14px',
    '& span': {
      padding: '0 4px 0 0 '
    }
  },

  '& .meta-header-bids': {
    color: '#838383'
  },
});

const MetaDiv = styled('div')({
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  // margin: '0 2px',
  padding: '8px',
  height: '272px',

  '& .meta-content-coin-icon': {
    width: '24px',
    height: '24px'
  }
})

const MetaHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '232px',
  borderBottom: 'solid 1px #c4c4c4',

  '& .meta-header-left': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& .meta-header-title': {
      fontSize: '24px'
    },

    '& .meta-header-title:hover': {
      color: '#D400BD',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  },
  '& .meta-header-right': {
    display: 'flex',
    justifyContent: 'space-between',
  },
})

const MetaContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1
})

const CardImage = styled('img')({
  width: '177px',
  height: '270px'
})

const MetaContentBidAmount = styled('div')({
  display: 'flex',
  alignItems: 'center',
  fontSize: '24px',
  lineHeight: '1rem',
  margin: '6px 0 0 -4px',

  '& .meta-content-coin-text': {
    alignItems: 'flex-end',
    fontSize: '18px',
    padding: '6px 0 0 4px'
  }
})

const MetaContentRow = styled('div')({

  margin: '8px 0',
  display: 'flex',
  flexDirection: 'column',

  '& button': {
    fontFamily: 'Oswald',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '18px',
    lineHeight: '27px',
    color: 'white',
    backgroundColor: '#D400BD',

    display: 'flex',
    alignItems: 'flex-end'
  }
})

const MetaContentTip = styled('div')({
  fontSize: '12px',
  lineHeight: '1rem',
  color: '#838383',
})

const MetaContentTime = styled('div')({
  display: 'flex',
  alignItems: 'center',
  lineHeight: '1rem',
  '& .meta-content-remaining-time': {
    margin: '0 0 0 4px'
  }
})

const MetaContentButtonSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: 'auto',
  marginBottom: 0,
  justifyContent: 'end',

  '& button': {
    fontFamily: 'Oswald',
    fontStyle: 'normal',
    fontSize: '18px',
    lineHeight: '27px',
    color: 'white',

    display: 'flex',
    alignItems: 'flex-end',
    textTransform: 'capitalize',
    fontWeight: '400',
    justifyContent: 'flex-start'
  },

  '& .button-bid': {
    marginBottom: '2px',
    backgroundColor: '#D400BD',
    width: '100%',
    padding: '6px 8px',

  },

  '& .button-more-info': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#474747',
  },
})

const DetailCardsDiv = styled('div')({
  flexGrow: 1,
  margin: '0 12px'
})

const CardsContainer = styled('div')({
  flexGrow: '1',
  overflowX: 'auto',
  display: 'flex',
  flexBasis: '100%',
  width: '100%',
})

const AuctionItem = ({
  content
}) => {

  const {
    state: { contracts, wallet  },
  } = useContext(store);
  const history = useHistory();
  const [cardPageNo, setCardPageNo] = useState(1);
  const [minIncrement, setMinIncrement] = useState("");
  const [favorite, setFavorite] = useState(false)
  const [remainingTime, setRemainingTime] = useState("")
  const [offers, setOffers] = useState([]);
  const [bidInProgress, setBidInProgress] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const theme = useTheme();

  const auctionItem = content
  const { itemNumber, highestBid } = auctionItem
  const coinType = auctionItem.saleToken === zoomContractAddress ? 'ZOOM' : (auctionItem.saleToken === wmovrContractAddress ?'WMOVR' : '' )

  const getOffers = async () => {
    const offers = await fetchOffers(
      content.itemNumber
    );
    setOffers(offers);
  };

  useEffect( () => {
    getOffers(content.itemNumber)
    getMinIncrement()
    let interval = null
    interval = setInterval(() => {
      updateRemainingTime()
    }, 1000);
  }, [content.itemNumber]);

  const updateRemainingTime = () => {
    const timeDiff = ((moment.unix(auctionItem.auctionEnd).diff(moment())) / 1000)

    const remainingDays = Math.floor(timeDiff / (3600 * 24))
    const remainingHours = Math.floor((timeDiff % (3600 * 24)) / 3600)
    const remainingMinutes = Math.floor((timeDiff % (3600)) / 60)
    const remainingSeconds = Math.floor(timeDiff % 60)

    setRemainingTime(formatTwoPlace(remainingDays) + "d " + formatTwoPlace(remainingHours) + "h " + formatTwoPlace(remainingMinutes) + "m " + formatTwoPlace(remainingSeconds) + "s ")
  }

  const formatTwoPlace = (value) => {
    if (value > 9) {
      return value
    } else {
      return '0' + value
    }
  }

  const getMinIncrement = async  () => {
    // const increment = await contracts.MarketContract.tokenMinIncrement(auctionItem.saleToken)
    // if (auctionItem.saleToken === '')
    // setMinIncrement(ethers.utils.formatEther(increment))
    setMinIncrement('1000')
  }

  const onClickBid = () => {

  }

  const handleConfirmBid = async (amount) => {
    const { currency, id } = auctionItem;
    let currencyContract;

    if (parseFloat(amount) <= auctionItem?.highestBid || parseFloat(amount) <= auctionItem?.minPrice) {
      throw new Error(`Invalid amount valid : ${amount}`);
    }

    switch (currency) {
      case "ZOOM":
        currencyContract = contracts.ZoomContract;
        break;
      case "WMOVR":
        currencyContract = contracts.WMOVRContract;
        break;
      default:
        throw new Error(`Unhandled currency type: ${currency}`);
    }

    const weiAmount = ethers.utils.parseEther(amount);

    const approveTx = await currencyContract.approve(
      marketContractAddress,
      weiAmount
    );
    setApprovalModalOpen(true);
    await approveTx.wait();
    setApprovalModalOpen(false);
    setBidInProgress(true);
    const bidTx = await contracts.MarketContract.bid(
      parseInt(id),
      weiAmount
    );
    await bidTx.wait();
    setBidInProgress(false);
    getOffers();
  };

  const toggleFavorite = () => {
    setFavorite(!favorite)
  }

  const gotoAuction = () => {
    history.push(`/listing/${auctionItem.itemNumber}`);
  }

  // const handleCardsTablePageChanged = (event, value) => {
  //   setCardPageNo(value)
  // }

  return (
    <Container className={"container"}>
      <MetaDiv>
        <MetaHeader>
          <div className={"meta-header-left"}>
            <div className={"meta-header-title"} onClick={gotoAuction}>
              Auction #{itemNumber}
            </div>
            {
              favorite ? (
                <FontAwesomeIcon
                  icon={faHeartSolid}
                  color={'rgba(255, 0, 0, 0.87)'}
                  size="lg"
                  onClick={toggleFavorite}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faHeart}
                  color={'rgba(0, 0, 0, 0.87)'}
                  size="lg"
                  onClick={toggleFavorite}
                />
              )
            }

          </div>
          <div className={"meta-header-right"}>
            <div className={"meta-header-cards-tip"}>
              <span style={{color: theme.colors.epic}}>{auctionItem.cards.filter( card => { return card.rarity.toLowerCase() === 'epic' }).length}E</span>
              <span style={{color: theme.colors.rare}}>{auctionItem.cards.filter( card => { return card.rarity.toLowerCase() === 'rare' }).length}R</span>
              <span style={{color: theme.colors.uncommon}}>{auctionItem.cards.filter( card => { return card.rarity.toLowerCase() === 'uncommon' }).length}U</span>
              <span style={{color: theme.colors.common}}>{auctionItem.cards.filter( card => { return card.rarity.toLowerCase() === 'common' }).length}C</span>
            </div>
            <div className={"meta-header-bids"}>
              {offers.length > 0 ? offers.length : 'No'} bids
            </div>
          </div>
        </MetaHeader>

        <MetaContent>
          <MetaContentRow>
            <MetaContentBidAmount>
              <img className={"meta-content-coin-icon"} src={coinType === 'ZOOM' ? zoomCoin : movrLogo} alt="WMOVR" loading="lazy"/>
              <span>{Math.round(parseFloat(highestBid) * 10000) / 10000 + " " }</span>
              <span className={"meta-content-coin-text"}>{coinType}</span>
            </MetaContentBidAmount>
            <MetaContentTip>
              Highest Bid
            </MetaContentTip>
          </MetaContentRow>
          <MetaContentRow>
            <MetaContentTime>
              <FontAwesomeIcon
                icon={faClock}
                size="lg"
              />
              <span className={"meta-content-remaining-time"}>
              {moment().isBefore(moment.unix(auctionItem.auctionEnd)) ? remainingTime : moment.unix(auctionItem.auctionEnd).format("MM/DD/YYYY, h:mm:ss A")}
              </span>
            </MetaContentTime>
            <MetaContentTip>
              Remaining time
            </MetaContentTip>
          </MetaContentRow>
          <MetaContentButtonSection>
            {/*<Button className={"button-bid"} onClick={onClickBid}>Quick Bid {"(" + (*/}
            {/*  auctionItem.highestBid > 0 ?*/}
            {/*    Math.round(parseFloat(auctionItem.highestBid) * 10000) / 10000 :*/}
            {/*    Math.round((parseFloat(auctionItem.minPrice) + parseFloat(minIncrement)) * 10000) / 10000) + " " + coinType + ")"}</Button>*/}
            <OfferDialog
              currency={coinType}
              minAmount={parseFloat(auctionItem.highestBid) > (parseFloat(auctionItem.minPrice) + parseFloat(minIncrement)) ? parseFloat(auctionItem.highestBid) : (parseFloat(auctionItem.minPrice)  + parseFloat(minIncrement))}
              maxAmount={coinType === 'ZOOM' ? parseFloat(wallet.zoomBalance) : parseFloat(wallet.wmovrBalance)}
              onConfirm={handleConfirmBid}
              disabled={moment().isAfter(moment.unix(auctionItem.auctionEnd))}
              quickBid
            />
            <Button className={"button-more-info"} onClick={gotoAuction}>More Info
              <FontAwesomeIcon
                icon={faChevronRight}
                size="sm"
              />
            </Button>

          </MetaContentButtonSection>
        </MetaContent>
      </MetaDiv>

      <DetailCardsDiv>
        <CardsContainer>
          {auctionItem?.cards ?
            auctionItem.cards.slice((cardPageNo - 1) * 5, cardPageNo * 5).map((card) => (
              <CardImage key={card.id} src={cardImageBaseURL + "/" + card.id} alt={"CARD " + card.id} loading="lazy"/>
            )) : <CircularProgress/>}
        </CardsContainer>
        {/*{auctionItem.cards && <Pagination count={Math.ceil(auctionItem.cards.length / 20)} className={"pagination-bar"} variant="outlined" shape="rounded" onChange={handleCardsTablePageChanged}/>}*/}
      </DetailCardsDiv>

    </Container>
  );
};

export default AuctionItem;
