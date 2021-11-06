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
import {cardImageBaseURL, zoomContractAddress} from "../constants";
import { useTheme } from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


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

  '& .meta-div': {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    // margin: '0 2px',
    padding: '8px',
    height: '272px',

    '& .meta-header': {
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
        }
      },
      '& .meta-header-right': {
        display: 'flex',
        justifyContent: 'space-between',
      },
    },

    '& .meta-content-coin-icon': {
      width: '24px',
      height: '24px'
    }
  },

  '& .meta-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },

  '& .card-image': {
    width: '177px',
    height: '270px'
  },

  '& .meta-content-bid-amount': {
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
  },

  '& .meta-content-tip': {
    fontSize: '12px',
    lineHeight: '1rem',
    color: '#838383',
  },

  '& .meta-header-cards-tip': {
    fontSize: '14px',
    '& span': {
      padding: '0 4px 0 0 '
    }

  },

  '& .meta-header-bids': {
    color: '#838383'
  },

  '& .meta-content-time': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1rem',
    '& .meta-content-remaining-time': {
      margin: '0 0 0 4px'
    }
  },

  '& .meta-content-row': {
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
  },

  '& .meta-content-button-section': {
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
      marginBottom: '1px',
      backgroundColor: '#D400BD',
    },

    '& .button-more-info': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#474747',
    },


  },

  '& .detail-cards': {
    flexGrow: 1,
    '& .cards-container': {
      flexGrow: '1',
      overflowX: 'auto',
      display: 'flex',
      flexBasis: '100%',
      width: '100%',

      // flexWrap: 'wrap',
    }
  }
});

const AuctionItem = ({
  content
}) => {

  const [cardPageNo, setCardPageNo] = useState(1);

  const theme = useTheme();

  const auctionItem = content

  const { itemNumber, highestBid } = auctionItem

  const coinType = auctionItem.saleToken === zoomContractAddress ? 'ZOOM' : 'WMOVR'

  const onClickBid = () => {

  }

  const onClickMoreInfo = () => {

  }

  const handleCardsTablePageChanged = (event, value) => {
    setCardPageNo(value)
  }

  return (
    <Container className={"container"}>
      <div className={"meta-div"}>
        <div className={"meta-header"}>
          <div className={"meta-header-left"}>
            <div className={"meta-header-title"}>
              Auction #{itemNumber}
            </div>

            <FontAwesomeIcon
              icon={faHeart}
              color={'rgba(0, 0, 0, 0.87)'}
              size="lg"
            />


          </div>
          <div className={"meta-header-right"}>
            <div className={"meta-header-cards-tip"}>
              <span style={{color: theme.colors.epic}}>1E</span>
              <span style={{color: theme.colors.rare}}>5R</span>
              <span style={{color: theme.colors.uncommon}}>3U</span>
              <span style={{color: theme.colors.common}}>6C</span>
            </div>
            <div className={"meta-header-bids"}>
              4 bids
            </div>
          </div>
        </div>

        <div className={"meta-content"}>
          <div className={"meta-content-row"}>
            <div className={"meta-content-bid-amount"}>
              <img className={"meta-content-coin-icon"} src={coinType === 'ZOOM' ? zoomCoin : movrLogo} alt="WMOVR"/>
              <span>{highestBid + " " }</span>
              <span className={"meta-content-coin-text"}>{coinType}</span>
            </div>
            <div className={"meta-content-tip"}>
              Highest Bid
            </div>
          </div>
          <div className={"meta-content-row"}>
            <div className={"meta-content-time"}>
              <FontAwesomeIcon
                icon={faClock}
                size="24px"
                className="card-booster-shop-icon"
              />
              <span className={"meta-content-remaining-time"}>
              {"04d 03h 08m 02s"}
              </span>
            </div>
            <div className={"meta-content-tip"}>
              Remaining time
            </div>
          </div>
          <div className={"meta-content-button-section"}>
            <Button className={"button-bid"} onClick={onClickBid}>Quick Bid {"(10.3333 " + coinType + ")"}</Button>
            <Button className={"button-more-info"} onClick={onClickMoreInfo}>More Info
              <FontAwesomeIcon
                icon={faChevronRight}
                size="sm"
                className="card-booster-shop-icon"
              />
            </Button>

          </div>
        </div>
      </div>

      <div className={"detail-cards"}>

        <div className={"cards-container"}>
          {auctionItem?.cards ?
            auctionItem.cards.slice((cardPageNo - 1) * 5, cardPageNo * 5).map((card) => (
              <LazyLoad key={card.id} once={true} resize={true}>
                {/*<img key={card.id} className={"card-image"} src={cardImageBaseURL + "/" + card.id} alt={"CARD " + card.id}/>*/}
              </LazyLoad>
            )) : <CircularProgress/>}
        </div>
        {/*{auctionItem.cards && <Pagination count={Math.ceil(auctionItem.cards.length / 20)} className={"pagination-bar"} variant="outlined" shape="rounded" onChange={handleCardsTablePageChanged}/>}*/}
      </div>

    </Container>
  );
};

export default AuctionItem;
