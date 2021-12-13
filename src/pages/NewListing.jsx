import React, { useContext, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import styled from 'styled-components/macro'
import SelectSource from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DateTimePicker from '@mui/lab/DateTimePicker'
import TextField from '@mui/material/TextField'
import { store } from 'store/store'
import { omit } from 'lodash'
import { useHistory } from 'react-router-dom'
import { ethers } from 'ethers'
import LazyLoad from 'react-lazyload'
import { CircularProgress } from '@mui/material'
import {
  marketContractAddress,
  zoombiesContractAddress,
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
} from '../constants'
import { useFetchUserNFTQuery } from 'hooks/useProfile'
import zoomLogo from '../assets/zoombies_coin.svg'
import LoadingModal from 'components/LoadingModal'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircle from '@mui/icons-material/CheckCircle';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 12px;

  h1 {
    margin-top: 0;
    margin-bottom: 10px;
    color: white;
  },
`

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;

  & > *:first-child {
    margin-right: 10px;
  }

  .zoom-burn-fee {
    display: flex;
    align-items: center;
  }
`

const CenteredRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 4px;

  &:hover {
    background: #eee;
    cursor: pointer;

    input {
      cursor: pointer;
    }
  }

  img {
    width: 175px;
  }
`

const Form = styled.div`
  background: white;
  flex: 1;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(4, 4, 4, 0.05);
  padding: 10px 40px 10px 5px;
  border-radius: 4px;

  font-size: 16px;
  font-weight: 500;
`

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
`

const Select = styled(SelectSource)`
  div {
    min-width: 0;
    padding: 10px;
  }
`

const NFTContainer = styled.div`
  flex: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(calc(0.55 * 260px), 1fr));
  min-height: 270px;
  overflow-y: auto;
  border-radius: 4px;
  box-shadow: 0 6px 4px -4px gray;
  padding: 5px;
`

const StyledLogo = styled.img`
  width: 30px;
  padding: '0 5px';
  margin-left: 4px;
`

const CURRENCY_TYPES = {
  WMOVR: 'WMOVR',
  ZOOM: 'ZOOM',
}

const tokenAddresses = {
  1285: {
    [CURRENCY_TYPES.WMOVR]: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    [CURRENCY_TYPES.ZOOM]: '0x8bd5180Ccdd7AE4aF832c8C03e21Ce8484A128d4',
  },
  1287: {
    [CURRENCY_TYPES.WMOVR]: '0x372d0695E75563D9180F8CE31c9924D7e8aaac47',
    [CURRENCY_TYPES.ZOOM]: '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316',
  },
}

const getCurrencyAddress = (currency, networkId) => {
  return tokenAddresses[networkId]?.[currency]
}

const renderUserNFTs = (
  userNFTs,
  chainId,
  handleCardClicked,
  selectedCards
) => {
  if (!userNFTs || !chainId) {
    return null
  }

  if (userNFTs.length === 0) {
    return (
      <div>
        You do not have any NFTs to list, you can mint Zoombies&nbsp;
        <a
          target="_blank"
          rel="noreferrer"
          href={
            chainId === 1287
              ? `${ZoombiesTestingEndpoint}`
              : `${ZoombiesStableEndpoint}`
          }
        >
          here
        </a>
      </div>
    )
  }

  return userNFTs.map((card) => (
    <LazyLoad key={card.id} once={true} resize={true}>
      <CardWrapper onClick={() => handleCardClicked(card.id)} key={card.id}>
        <img
          src={`https://moonbase.zoombies.world/nft-image/${card.id}`}
          alt={`Token #${card.id}`}
        />
        <input type="checkbox" checked={!!selectedCards[card.id]} readOnly />
      </CardWrapper>
    </LazyLoad>
  ))
}

const NewListing = () => {
  const history = useHistory()
  const [isDateError, setIsDateError] = useState(false)
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 86400000 * 3)
  )
  const [listPrice, setListPrice] = useState('0')
  const [createInProgress, setCreateInProgress] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_TYPES.WMOVR)
  const [selectedCards, setSelectedCards] = useState({})
  const [approveZoomInProgress, setApproveZoomInProgress] = useState(false)
  const [isApprovedForAll, setIsApprovedForAll] = useState(false)

  const {
    state: { contracts, wallet },
  } = useContext(store)

  useEffect(() => {
    const getIsApprovedForAll = async () => {
      if (contracts.ZoombiesContract != null) {
        const approved = await contracts.ZoombiesContract.isApprovedForAll(wallet.address, marketContractAddress);
        setIsApprovedForAll(approved);
      }
    }

    getIsApprovedForAll().then();
  }, [contracts.ZoombiesContract]);

  const handleCardClicked = (cardId) => {
    if (selectedCards[cardId]) {
      setSelectedCards({
        ...omit(selectedCards, cardId),
      })
    } else {
      setSelectedCards({
        ...selectedCards,
        [cardId]: true,
      })
    }
  }

  const handeDateError = (err) => {
    if (err) {
      setIsDateError(true)
    } else {
      setIsDateError(false)
    }
  }

  const createListing = async () => {
    setCreateInProgress(true)
    try {
      const zoomBurn = data?.zoomBurnFee
        ? data.zoomBurnFee * numberOfSelectedCards
        : 0
      const weiAmount = ethers.utils.parseEther(zoomBurn.toString())
      setApproveZoomInProgress(true)
      const tx = await contracts.ZoomContract.approve(
        marketContractAddress,
        weiAmount
      )
      await tx.wait()
      setApproveZoomInProgress(false)
      await contracts.MarketContract.listItem(
        parseInt((new Date(dateTime).getTime() / 1000).toFixed(0)),
        ethers.utils.parseEther(listPrice),
        Object.keys(selectedCards).map((id) => parseInt(id)),
        zoombiesContractAddress,
        getCurrencyAddress(selectedCurrency, wallet.chainId)
      )
      setCreateInProgress(false)
      history.push('/')
    } catch (err) {
      console.error(err)
    } finally {
      setApproveZoomInProgress(false);
      setCreateInProgress(false)
    }
  }

  const requestApproveAllNFT = async () => {
    console.log("Call nftContract.setApprovalForAll(market.addres, true)");
  }

  const onKeyDown = (e) => {
    if (selectedCurrency === 'ZOOM') {
      if (e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 188) {
        // 'e', '.', ',' charaters
        e.preventDefault()
      }
    }
  }

  const handleAmountChanged = (e) => {
    const value = e.target.value

    let isDecimalOverflow = false
    if (selectedCurrency === 'WMOVR' && value.toString().includes('.')) {
      if (value.toString().split('.')[1].length > 4) {
        isDecimalOverflow = true
      }
    }

    if (isDecimalOverflow) {
      setListPrice(parseFloat(value).toFixed(4).toString())
    } else {
      setListPrice(value)
    }
  }

  const { isLoading, data } = useFetchUserNFTQuery(
    wallet.address,
    contracts.ZoombiesContract,
    contracts.MarketContract
  )

  const numberOfSelectedCards = Object.keys(selectedCards).length || 0
  const haveEnoughZoom =
    wallet?.zoomBalance > numberOfSelectedCards * data?.zoomBurnFee

  return (
    <Container>
      <LoadingModal
        text="Waiting for Zoom Approval..."
        open={approveZoomInProgress}
      />
      <h1>New Listing</h1>
      <Form>
        <FlexRow>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <h4>Review steps to list a successful NFT auction</h4>
            </AccordionSummary>
            <AccordionDetails>
              <ol>
                <li>Set a sell price</li>
                <li>Set auction end date ( under 2 weeks )</li>
                <li>Select 1 or bundle NFTs (up to 20) for auction</li>
                <li>Approve the market to list NFTs on your behalf ( one-time )</li>
                <li>Approve the market to burn your ZOOM listing Fee ( base fee X num. of NFTs)</li>
                <li>List your NFTs for auction</li>
                <li>Check back after your auction close date for the Highest Bid ! settle auction and collect bid with Zero sales Fee !</li>
              </ol>
            </AccordionDetails>
          </Accordion>
        </FlexRow>
        <FlexRow>
          <InputContainer>
            <CurrencyInput
              type="number"
              value={listPrice}
              // onChange={(e) => setListPrice(e.target.value)}
              onChange={handleAmountChanged}
              onKeyDown={onKeyDown}
              min={0}
              step={selectedCurrency === 'WMOVR' ? 0.0001 : 1}
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
        <FlexRow>
          {
            isApprovedForAll ?
              (<><CheckCircle color="success" />NFT listing Approved</>):
              (<Button
                variant="contained"
                color="error"
                onClick={requestApproveAllNFT}>
                Approve Market to list NFTs
              </Button>)
          }
        </FlexRow>
        <FlexRow>
        {<CheckCircle color="success" />}
          <div className="zoom-burn-fee">
            Zoom <StyledLogo src={zoomLogo} /> Burn Fee:{' '}
            {data && data.zoomBurnFee
              ? data.zoomBurnFee * numberOfSelectedCards
              : 0}{' '}
            {' '}
          </div>
        </FlexRow>
        <NFTContainer>
          {isLoading ? (
            <CircularProgress />
          ) : (
            renderUserNFTs(
              data?.userNFTs,
              wallet?.chainId,
              handleCardClicked,
              selectedCards
            )
          )}
        </NFTContainer>
        <CenteredRow>
          <Button
            variant="contained"
            disabled={
              !numberOfSelectedCards ||
              createInProgress ||
              isDateError ||
              listPrice === '' ||
              parseFloat(listPrice) <= 0 ||
              !haveEnoughZoom ||
              !isApprovedForAll
            }
            onClick={createListing}
          >
            {createInProgress
              ? 'Creating...'
              : `Create Listing (${numberOfSelectedCards})`}
          </Button>
        </CenteredRow>
      </Form>
    </Container>
  )
}

export default NewListing
