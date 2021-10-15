import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styled from "styled-components/macro";
import SelectSource from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DateTimePicker from "@mui/lab/DateTimePicker";
import TextField from "@mui/material/TextField";
import { store } from "store/store";
import getCardData from "utils/getCardData";
import Card from "components/Card";
import { omit } from "lodash";
import { useHistory } from "react-router-dom";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h1 {
    margin-top: 0;
    margin-bottom: 10px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;

  & > *:first-child {
    margin-right: 10px;
  }
`;

const CenteredRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    background: #eee;
    cursor: pointer;

    input {
      cursor: pointer;
    }
  }
`;

const Form = styled.div`
  background: white;
  flex: 1;
  padding: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(4, 4, 4, 0.05);
  padding: 10px 40px 10px 5px;
  border-radius: 4px;

  font-size: 16px;
  font-weight: 500;
`;

const CurrencyInput = styled.input`
  border: none;
  border-radius: 4px;
  height: 40px;
  padding: 0 10px;
  width: 100px;
  font-size: 18px;
  font-family: Oswald;
  position: relative;
  margin-right: 10px;
`;

const Select = styled(SelectSource)`
  div {
    min-width: 0;
    padding: 10px;
  }
`;

const NFTContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(calc(0.55 * 260px), 1fr));
  place-items: center;
  min-width: 600px;

  max-height: 550px;
  overflow-y: auto;
  border-radius: 4px;
  box-shadow: 0 6px 4px -4px gray;
  padding: 5px;
`;

const CURRENCY_TYPES = {
  WMOVR: "WMOVR",
  ZOOM: "ZOOM",
};

const tokenAddresses = {
  1285: {
    [CURRENCY_TYPES.WMOVR]: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
    [CURRENCY_TYPES.ZOOM]: "0x8bd5180Ccdd7AE4aF832c8C03e21Ce8484A128d4",
  },
  1287: {
    [CURRENCY_TYPES.WMOVR]: "0x372d0695E75563D9180F8CE31c9924D7e8aaac47",
    [CURRENCY_TYPES.ZOOM]: "0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316",
  },
};

const getCurrencyAddress = (currency, networkId) => {
  return tokenAddresses[networkId]?.[currency];
};

const NewListing = () => {
  const history = useHistory();
  const [isDateError, setIsDateError] = useState(false);
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 86400000 * 3)
  );
  const [listPrice, setListPrice] = useState("0");
  const [createInProgress, setCreateInProgress] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCY_TYPES.WMOVR
  );
  const [userNFTs, setUserNFTs] = useState([]);
  const [selectedCards, setSelectedCards] = useState({});
  const {
    state: { contracts, wallet },
  } = useContext(store);

  const handleCardClicked = (cardId) => {
    if (selectedCards[cardId]) {
      setSelectedCards({
        ...omit(selectedCards, cardId),
      });
    } else {
      setSelectedCards({
        ...selectedCards,
        [cardId]: true,
      });
    }
  };

  const handeDateError = (err) => {
    if (err) {
      setIsDateError(true);
    } else {
      setIsDateError(false);
    }
  };

  const getUserNFTs = async () => {
    const nftsCount = await contracts.ZoombiesContract.balanceOf(
      wallet.address
    );
    const tokensOfOwner = [];
    for (let i = 0; i < nftsCount; i++) {
      const nftTokenId = await contracts.ZoombiesContract.tokenOfOwnerByIndex(
        wallet.address,
        i
      );

      tokensOfOwner.push(nftTokenId);
    }

    const cards = await Promise.all(
      tokensOfOwner.map((token) =>
        getCardData(parseInt(token), contracts.ZoombiesContract)
      )
    );
    setUserNFTs(cards);
  };

  const createListing = async () => {
    setCreateInProgress(true);
    try {
      console.log(
        parseInt((new Date(dateTime).getTime() / 1000).toFixed(0)),
        parseInt(listPrice),
        Object.keys(selectedCards).map((x) => parseInt(x)),
        getCurrencyAddress(selectedCurrency, wallet.chainId)
      );
      await contracts.MarketContract.listItem(
        parseInt((new Date(dateTime).getTime() / 1000).toFixed(0)),
        parseInt(listPrice),
        Object.keys(selectedCards).map((x) => parseInt(x)),
        getCurrencyAddress(selectedCurrency, wallet.chainId)
      );
      history.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setCreateInProgress(false);
    }
  };

  useEffect(() => {
    if (contracts.ZoombiesContract && wallet.address) {
      getUserNFTs();
    }
  }, [contracts.ZoombiesContract, wallet.address]);

  return (
    <Container>
      <h1>New Listing</h1>
      <Form>
        <FlexRow>
          <span>Listing Price:</span>
          <InputContainer>
            <CurrencyInput
              type="number"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              min={0}
            />
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {Object.keys(CURRENCY_TYPES).map((value) => (
                <MenuItem value={value} key={value}>
                  {CURRENCY_TYPES[value]}
                </MenuItem>
              ))}
            </Select>
          </InputContainer>
        </FlexRow>
        <FlexRow>
          <span>Auction End:</span>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            value={dateTime}
            onChange={setDateTime}
            minDateTime={new Date(new Date().getTime() + 3600000)}
            maxDateTime={new Date(new Date().getTime() + 86400000 * 14)}
            onError={handeDateError}
          />
        </FlexRow>
        <FlexRow>
          <span>Select NFTs below from your Crypt to add to the listing:</span>
        </FlexRow>
        <NFTContainer>
          {userNFTs.map((card) => (
            <CardWrapper
              onClick={() => handleCardClicked(card.id)}
              key={card.id}
            >
              <Card
                cardClass={card.rarity}
                image={card.image}
                editionCurrent={card.edition_current}
                editionTotal={card.edition_total}
                name={card.name}
                cset={card.card_set}
                level={card.card_level}
                origin={card.in_store}
                unlockCzxp={card.unlock_czxp}
              />
              <input
                type="checkbox"
                checked={!!selectedCards[card.id]}
                readOnly
              />
            </CardWrapper>
          ))}
        </NFTContainer>
        <CenteredRow>
          <Button
            variant="contained"
            disabled={
              !Object.keys(selectedCards).length ||
              createInProgress ||
              isDateError
            }
            onClick={createListing}
          >
            {createInProgress
              ? "Creating..."
              : `Create Listing (${Object.keys(selectedCards).length})`}
          </Button>
        </CenteredRow>
      </Form>
    </Container>
  );
};

export default NewListing;