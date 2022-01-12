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
import { CircularProgress, ListItemIcon, ListItemText } from '@mui/material'
import {
  marketContractAddress,
  gNFTAddresses,
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint, cardImageBaseURL
} from '../constants'
import { useFetchUserNFTQuery, useGetZoomAllowanceQuery } from 'hooks/useProfile'
import zoomLogo from '../assets/zoombies_coin.svg'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UserAllowance from '../components/UserAllowance'
import Typography from '@mui/material/Typography'
import { compareAsBigNumbers, toBigNumber } from '../utils/BigNumbers'
import AntSwitch from '../components/AntSwitch'
import Stack from '@mui/material/Stack';

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
const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
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

const NFTSelect = styled(SelectSource)`
  width: 240px;
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`

const SelectItemImg = styled.img`
  width: 24px;
  height: 24px;
`

const NFTContainer = styled.div`
  flex: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(calc(0.55 * 260px), 1fr));
  min-height: 310px;
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
  MOVR: 'MOVR',
  ZOOM: 'ZOOM',
  // USDT: 'USDT',
  DAI: 'DAI'
}

const tokenAddresses = {
  1285: {
    [CURRENCY_TYPES.MOVR]: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    [CURRENCY_TYPES.ZOOM]: '0x8bd5180Ccdd7AE4aF832c8C03e21Ce8484A128d4',
    // [CURRENCY_TYPES.USDT]: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    [CURRENCY_TYPES.DAI]: '0xEc95c10d4DD55741DE9491751407DEA41A3eF5f1',
  },
  1287: {
    [CURRENCY_TYPES.MOVR]: '0x372d0695E75563D9180F8CE31c9924D7e8aaac47',
    [CURRENCY_TYPES.ZOOM]: '0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316',
    // [CURRENCY_TYPES.USDT]: '0x0b77D7BDd78b2a4C2c50980968166D99e321DfB6',
    [CURRENCY_TYPES.DAI]: '0xEc95c10d4DD55741DE9491751407DEA41A3eF5f1',
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
          src={card.isNotZoombies ? card.image : `${cardImageBaseURL}/${card.id}`}
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
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_TYPES.MOVR)
  const [selectedNFT, setSelectedNFT] = useState(!gNFTAddresses.isEmpty ? gNFTAddresses[0].address : '')
  const [selectedCards, setSelectedCards] = useState({})
  const [isApprovedForAll, setIsApprovedForAll] = useState(false)
  const [instantAuction, setInstantAuction] = useState(false)

  const {
    state: { contracts, wallet },
  } = useContext(store)

  useEffect(() => {
    const getIsApprovedForAll = async () => {
      if (contracts.nftContracts != null && !contracts.nftContracts.isEmpty) {
        const contract = contracts.nftContracts.find((e) => {
          return e.address === selectedNFT
        })
        if (contract) {
          const approved = await contract.isApprovedForAll(wallet.address, marketContractAddress);
          setIsApprovedForAll(approved);
        }
      }
    }

    getIsApprovedForAll().then();
  }, [wallet.address, contracts.nftContracts, selectedNFT]);

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
      console.log("currency", getCurrencyAddress(selectedCurrency, wallet.chainId));
      await contracts.MarketContract.listItem(
        instantAuction ? 0 : parseInt((new Date(dateTime).getTime() / 1000).toFixed(0)),
        ethers.utils.parseEther(listPrice),
        Object.keys(selectedCards).map((id) => parseInt(id)),
        selectedNFT,
        getCurrencyAddress(selectedCurrency, wallet.chainId)
      )
      setCreateInProgress(false)
      history.push('/')
    } catch (err) {
      console.error(err)
    } finally {
      setCreateInProgress(false)
    }
  }

  const approveContract = async () => {
    if (contracts.nftContracts && !contracts.nftContracts.isEmpty) {
      for (const contract of contracts.nftContracts) {
        if (contract != null) {
          const marketIsApproved = await contract.isApprovedForAll(
            wallet.address,
            marketContractAddress
          )

          if (!marketIsApproved) {
            setIsApprovedForAll(false)
            await contract.setApprovalForAll(marketContractAddress, true)
            setIsApprovedForAll(true)
          }
        }
      }
    }
  }

  const requestApproveAllNFT = async () => {
    await approveContract();
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
    if (selectedCurrency === 'MOVR' && value.toString().includes('.')) {
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

  const auctionModeChanged = ( event ) => {
    setInstantAuction(!event.target.checked)
  }

  const { isLoading, data } = useFetchUserNFTQuery(
    wallet.address,
    contracts.nftContracts.find((e) => {
      return e.address === selectedNFT
    }),
    contracts.MarketContract
  )

  const numberOfSelectedCards = Object.keys(selectedCards).length || 0
  const haveEnoughZoom = compareAsBigNumbers(parseInt(wallet?.zoomBalance), numberOfSelectedCards * data?.zoomBurnFee) === 1

  const { data: currentAllowance, isLoading: isLoadingAllowance } = useGetZoomAllowanceQuery(
    wallet.address,
    contracts.ZoomContract
  )

  const exceedZoomAllowance = toBigNumber(data?.zoomBurnFee ? numberOfSelectedCards * data?.zoomBurnFee : 0).gt(currentAllowance ? currentAllowance : toBigNumber(0))

  return (
    <Container>
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
              step={selectedCurrency === 'MOVR' ? 0.0001 : 1}
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
        <span>Auction Expires</span>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>Now</span>
          <AntSwitch defaultChecked={true} onChange={auctionModeChanged} inputProps={{ 'aria-label': 'ant design' }} />
          <span>Future</span>
        </Stack>
        <FlexRow>
        {
          !instantAuction && (
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              value={dateTime}
              onChange={setDateTime}
              disabled={instantAuction}
              minDateTime={new Date(new Date().getTime() + 3600000)}
              maxDateTime={new Date(new Date().getTime() + 86400000 * 14)}
              onError={handeDateError}
            />
          )
        }
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
          <FlexColumn>
            <FlexRow>
              {
                !exceedZoomAllowance && numberOfSelectedCards > 0 ?
                (
                  <CheckCircle color="success" />
                ) : (
                    <CancelIcon color="error" />
                  )
              }
              <div className="zoom-burn-fee">
                Zoom <StyledLogo src={zoomLogo} /> Burn Fee:
                {data && data.zoomBurnFee
                  ? ` ${ethers.utils.formatEther(toBigNumber(data.zoomBurnFee * numberOfSelectedCards))}`
                  : 0}{' '}
                { currentAllowance !== undefined ? `(Allowance : ${ethers.utils.formatEther(currentAllowance)})` : ''}
              </div>
            </FlexRow>
            {
              exceedZoomAllowance &&
              (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="h8">Increase ZOOM Allowance</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <UserAllowance initial={toBigNumber(data.zoomBurnFee ? data.zoomBurnFee * numberOfSelectedCards : 0)}/>
                  </AccordionDetails>
                </Accordion>
              )
            }
          </FlexColumn>
        </FlexRow>
        <NFTSelect
          value={selectedNFT}
          onChange={(e) => {
              setSelectedCards({})
              setSelectedNFT(e.target.value)
            }
          }
        >
          {
            gNFTAddresses.map((contract) => (
              <MenuItem value={contract.address} key={contract.address}>
                <ListItemIcon>
                  <SelectItemImg src={contract.icon}/>
                </ListItemIcon>
                <ListItemText primary={contract.name} />
              </MenuItem>
            ))
          }
        </NFTSelect>
        <NFTContainer>
          {isLoading || isLoadingAllowance ? (
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
                (isDateError && !instantAuction) ||
              listPrice === '' ||
              parseFloat(listPrice) <= 0 ||
              !haveEnoughZoom ||
              !isApprovedForAll ||
              exceedZoomAllowance
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
