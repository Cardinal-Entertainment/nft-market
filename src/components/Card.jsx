import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React from "react";
import styled from "styled-components";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { faTag } from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  margin: 0;
  perspective: 600px;
  height: calc(0.55 * 410px);
  width: calc(0.55 * 260px);
  font-size: 10px;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif,
    Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;

  .card-bg {
    display: inline-block;
    width: 100%;
    height: 100%;
    text-align: center;
    margin-bottom: 3px;
    padding-bottom: 4px;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: 0px;
  }

  .card-bg-6 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_common_brown.svg");
  }

  .card-bg-5 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_uncommon_blue.svg");
  }

  .card-bg-4 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_rare_red.svg");
  }

  .card-bg-3 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_epic_purple.svg");
  }

  .card-bg-2 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_platinum.svg");
  }

  .card-bg-1 {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_diamond.svg");
  }

  .card-bg-back-bsc {
    background-image: url("https://zoombies.world/images/dapp/zoombies_card_back.svg");
    padding: 20px;
  }

  #image-container {
    position: absolute;
    top: 15%;
    left: 10%;
    right: 10%;
    height: 45%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  .card-img {
    width: 80%;
  }

  #top-right-corner {
    position: absolute;
    top: 4%;
    right: 0;
    width: 19%;
    height: 12%;
    border-radius: 50%;
    border: 3px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${({ originColor }) => originColor};
  }

  #bottom-right-corner {
    position: absolute;
    bottom: 2.5%;
    right: 0;
    width: 19%;
    height: 12%;
    display: flex;
    justify-content: center;
    align-items: center;

    font-weight: bold;
    color: #fff;
  }

  #card-edition {
    position: absolute;
    top: 62%;
    bottom: 32%;
    left: 10%;
    right: 10%;
    color: #ddd;
    font-weight: 700;
  }

  #card-name {
    font-weight: bold;
    position: absolute;
    left: 5%;
    right: 5%;
    top: 70%;
    bottom: 13%;
    color: black;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  #bottom-text {
    position: absolute;
    color: #fff;
    font-weight: bold;
    left: 21%;
    right: 21%;
    bottom: 5%;
    height: 7%;
    text-align: left;
    display: flex;
    align-items: center;
  }

  .card-txt-black {
    color: #000;
  }

  /* Back of card stuff */
  .card-txt-white {
    color: #fff;
  }

  /** Card **/

  /* flip the pane when hovered */
  #flip-container.flipped {
    transform: rotateY(180deg);
  }

  #flip-container {
    transition: transform 0.6s;
    transform-style: preserve-3d;

    position: relative;
  }
  #flip-container,
  .front,
  .back {
    width: 100%;
    height: 100%;
  }

  @media (hover: hover) and (pointer: fine) {
    #card-container:hover #flip-container.flipped {
      transform: rotateY(180deg);
    }
  }

  /* hide back of pane during swap */
  .front,
  .back {
    backface-visibility: hidden;

    position: absolute;
    top: 0;
    left: 0;
  }

  /* front pane, placed above back */
  .front {
    z-index: 2;
    /* for firefox 31 */
    transform: rotateY(0deg);
  }

  /* back, initially hidden pane */
  .back {
    transform: rotateY(180deg);
    position: relative;
  }

  .attribute-name {
    padding-right: 5px;
  }

  .card-booster-shop-icon {
    color: #000000;
  }
`;

const Card = ({
  cardClass,
  image,
  editionCurrent,
  editionTotal,
  name,
  cset,
  level,
  origin,
  unlockCzxp,
}) => {
  const getEditionLabel = () => {
    if (editionTotal === 0) {
      return "#" + editionCurrent;
    }
    return "#" + editionCurrent + " of " + editionTotal;
  };

  const getOriginColor = () => {
    if (origin === "Store") {
      return "#FFA500"; //orange
    } else {
      return "#F8FF02"; //yellow
    }
  };

  return (
    <Container originColor={getOriginColor()}>
      <div id="flip-container">
        <div className={classnames({ [cardClass]: true, front: true })}>
          <div id="image-container">
            <img className="card-img" src={image} />
          </div>
          <div id="card-edition">
            <span>{getEditionLabel()}</span>
          </div>
          <div id="card-name">
            {name}
            <br />
            {cset}
          </div>
          <div id="bottom-text">{parseInt(unlockCzxp).toLocaleString()}</div>
          <div id="bottom-right-corner">{level}</div>
          <div className="card-booster-shop card-booster-shop-circle" />
          <div id="top-right-corner">
            {origin === "Booster" && (
              <FontAwesomeIcon
                icon={faBolt}
                size="lg"
                className="card-booster-shop-icon"
              />
            )}
            {origin === "Store" && (
              <FontAwesomeIcon
                icon={faTag}
                size="lg"
                className="card-booster-shop-icon"
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Card;
