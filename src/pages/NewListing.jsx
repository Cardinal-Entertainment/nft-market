import React, { useContext, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import styled from 'styled-components/macro'
import SelectSource from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DateTimePicker from '@mui/lab/DateTimePicker'
import TextField from '@mui/material/TextField'
import { store } from 'store/store'
import { omit } from 'lodash'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import LazyLoad from 'react-lazyload'
import { CircularProgress, ListItemIcon, ListItemText } from '@mui/material'
import {
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
  NETWORKS,
  NFT_CONTRACTS,
  CHAIN_ID_TO_NETWORK,
  CURRENCY_ICONS,
  CURRENCY_TYPES,
  CURRENCY_TYPES_MOONBASE_A,
  CURRENCY_TYPES_MOONRIVER
} from '../constants'
import {
  useFetchUserNFTQuery,
  useGetZoomAllowanceQuery,
} from 'hooks/useProfile'
import zoomLogo from '../assets/zoombies_coin.svg'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Tooltip from '@mui/material/Tooltip'
import CancelIcon from '@mui/icons-material/Cancel'
import UserAllowance from '../components/UserAllowance'
import Typography from '@mui/material/Typography'

import Snackbar from '@mui/material/Snackbar'
import Slide, { SlideProps } from '@mui/material/Slide'

import { compareAsBigNumbers, toBigNumber } from '../utils/BigNumbers'
import AntSwitch from '../components/AntSwitch'
import Stack from '@mui/material/Stack'

import '../assets/scss/Newlisting.scss'
import { getCurrencyAddress, parseAmountToBigNumber } from 'utils/currencies'
import { waitForTransaction } from 'utils/transactions'
import classNames from 'classnames'
import { removeUserNFTFromCache } from 'utils/cardsUtil'
import { useQueryClient } from 'react-query'

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
  border-radius: 9999px;
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

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

const renderUserNFTs = (
  userNFTs,
  chainId,
  handleCardClicked,
  selectedCards,
  cardsBeingListed
) => {
  if (!userNFTs || !chainId) {
    return null
  }

  const network = CHAIN_ID_TO_NETWORK[chainId]
  const imageUrl = NETWORKS[network].imageUrl

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
      <CardWrapper
        className={classNames({
          'card-image-wrapper-disabled': cardsBeingListed[card.id],
        })}
        onClick={() => handleCardClicked(card.id)}
        key={card.id}
      >
        <img
          src={card.isNotZoombies ? card.image : `${imageUrl}/${card.id}`}
          alt={`Token #${card.id}`}
          className={classNames({
            'card-image-disabled': cardsBeingListed[card.id],
          })}
        />
        <div>ID: {card.id}</div>
        <input
          type="checkbox"
          checked={!!selectedCards[card.id] || !!cardsBeingListed[card.id]}
          readOnly
        />
      </CardWrapper>
    </LazyLoad>
  ))
}

const NewListing = () => {
  const { network } = useParams()
  const marketAddress = NETWORKS[network].marketContractAddress
  const nftContracts = NFT_CONTRACTS[network]

  const [isDateError, setIsDateError] = useState(false)
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 86400000 * 3)
  )
  const [listPrice, setListPrice] = useState('0')
  const [createInProgress, setCreateInProgress] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_TYPES.MOVR)
  const [selectedNFT, setSelectedNFT] = useState(
    !nftContracts.isEmpty ? nftContracts[0].address : ''
  )

  const [selectedCards, setSelectedCards] = useState({})
  const [cardsBeingListed, setCardsBeingListed] = useState([])
  const [isApprovedForAll, setIsApprovedForAll] = useState(false)
  const [instantAuction, setInstantAuction] = useState(false)

  const [isNewListingToastOpen, setIsNewListingToastOpen] =
    React.useState(false)

  const queryClient = useQueryClient()

  const {
    state: { contracts, wallet },
  } = useContext(store)

  useEffect(() => {
    const getIsApprovedForAll = async () => {
      if (
        contracts.nftContracts &&
        Object.keys(contracts.nftContracts).length > 0
      ) {
        const readOnlyContract = contracts.nftContracts[selectedNFT]?.readOnly

        if (readOnlyContract) {
          const approved = await readOnlyContract.isApprovedForAll(
            wallet.address,
            marketAddress
          )
          setIsApprovedForAll(approved)
        }
      }
    }

    getIsApprovedForAll()
  }, [wallet.address, contracts.nftContracts, selectedNFT, marketAddress])

  const handleCardClicked = (cardId) => {
    if (cardsBeingListed[cardId]) return
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

  const handleDateError = (err) => {
    if (err) {
      setIsDateError(true)
    } else {
      setIsDateError(false)
    }
  }

  const createListing = async () => {
    setCreateInProgress(true)

    const currencyAddress = getCurrencyAddress(network, selectedCurrency)
    const listingPrice = parseAmountToBigNumber(
      listPrice,
      currencyAddress,
      network
    )

    try {
      const tokenIds = Object.keys(selectedCards).map((id) => parseInt(id))
      const tx = await contracts.MarketContract.listItem(
        instantAuction
          ? 0
          : parseInt((new Date(dateTime).getTime() / 1000).toFixed(0)),
        listingPrice.toString(),
        tokenIds,
        selectedNFT,
        getCurrencyAddress(network, selectedCurrency)
      )
      setCreateInProgress(false)
      const unavailableCards = {
        ...cardsBeingListed,
        ...selectedCards,
      }
      setSelectedCards({})
      setCardsBeingListed(unavailableCards)

      setIsNewListingToastOpen(true)
      await waitForTransaction(tx)

      removeUserNFTFromCache(
        queryClient,
        tokenIds,
        wallet.address,
        contracts.nftContracts[selectedNFT]?.readOnly,
        contracts.ReadOnlyMarketContract,
        network
      )
    } catch (err) {
      console.error(err)
    } finally {
      setCreateInProgress(false)
    }
  }

  const approveContract = async () => {
    if (
      contracts.nftContracts &&
      Object.keys(contracts.nftContracts).length > 0
    ) {
      const readOnlyContract = contracts.nftContracts[selectedNFT]?.readOnly

      if (readOnlyContract) {
        const approved = await readOnlyContract.isApprovedForAll(
          wallet.address,
          marketAddress
        )

        if (!approved) {
          setIsApprovedForAll(false)
          const signedContract = contracts.nftContracts[selectedNFT]?.signed
          await signedContract.setApprovalForAll(marketAddress, true)
          setIsApprovedForAll(true)
        }
      }
    }
  }

  const requestApproveAllNFT = async () => {
    await approveContract()
  }

  const onKeyDown = (e) => {
    if (selectedCurrency === CURRENCY_TYPES.ZOOM) {
      if (e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 188) {
        // 'e', '.', ',' charaters
        e.preventDefault()
      }
    }
  }

  const handleAmountChanged = (e) => {
    const value = e.target.value

    let isDecimalOverflow = false
    if (
      selectedCurrency === CURRENCY_TYPES.MOVR &&
      value.toString().includes('.')
    ) {
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

  const auctionModeChanged = (event) => {
    setInstantAuction(!event.target.checked)
  }

  const { isLoading, data } = useFetchUserNFTQuery(
    wallet.address,
    contracts.nftContracts[selectedNFT]?.readOnly,
    contracts.ReadOnlyMarketContract,
    network
  )

  const numberOfSelectedCards = Object.keys(selectedCards).length || 0
  
  const haveEnoughZoomBurn =
    compareAsBigNumbers(
      parseInt(wallet?.zoomBalance),
      numberOfSelectedCards * data?.zoomBurnFee
    ) === 1

  const { data: currentAllowance, isLoading: isLoadingAllowance } =
    useGetZoomAllowanceQuery(wallet.address, contracts.ZoomContract, network)

  const exceedZoomAllowance = toBigNumber(
    data?.zoomBurnFee ? numberOfSelectedCards * data?.zoomBurnFee : 0
  ).gt(currentAllowance ? currentAllowance : toBigNumber(0))

  const onClose = () => {
    setIsNewListingToastOpen(false)
  }

  return (
    <Container>
      <Snackbar
        open={isNewListingToastOpen}
        onClose={onClose}
        TransitionComponent={SlideTransition}
        message="Your NFTs are being listed..."
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={4000}
        key={Object.keys(selectedCards).join('-')}
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
                <li>
                  Approve the market to list NFTs on your behalf ( one-time )
                </li>
                <li>
                  Approve the market to burn your ZOOM listing Fee ( base fee X
                  num. of NFTs)
                </li>
                <li>List your NFTs for auction</li>
                <li>
                  Check back after your auction close date for the Highest Bid !
                  settle auction and collect bid with Zero sales Fee !
                </li>
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
              step={selectedCurrency === CURRENCY_TYPES.MOVR ? 0.0001 : 1}
            />
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            > 
            {wallet.chainId == '1285' ? 
              Object.keys(CURRENCY_TYPES_MOONRIVER).map((value) => (
                <MenuItem value={value} key={value}>
                  <div className="new-listing-dropdown-item">
                    <img src={CURRENCY_ICONS[value]} alt="" style={{borderRadius: '9999px'}}/>
                    {CURRENCY_TYPES[value]}
                  </div>
                </MenuItem>
              ))
            :
              Object.keys(CURRENCY_TYPES_MOONBASE_A).map((value) => (
                <MenuItem value={value} key={value}>
                  <div className="new-listing-dropdown-item">
                    <img src={CURRENCY_ICONS[value]} alt="" style={{borderRadius: '9999px'}}/>
                    {CURRENCY_TYPES[value]}
                  </div>
                </MenuItem>
              ))
            }  
            </Select>
          </InputContainer>
        </FlexRow>
        <Tooltip
          title="Auctions can expire upon first bid, or at a future date"
          placement="right-start"
          arrow
        >
          <h3>Auction Expires</h3>
        </Tooltip>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>Now</span>
          <AntSwitch
            defaultChecked={true}
            onChange={auctionModeChanged}
            inputProps={{ 'aria-label': 'ant design' }}
          />
          <span>Future</span>
        </Stack>
        <FlexRow>
          {!instantAuction && (
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              value={dateTime}
              onChange={setDateTime}
              disabled={instantAuction}
              minDateTime={new Date(new Date().getTime() + 3600000)}
              maxDateTime={new Date(new Date().getTime() + 86400000 * 14)}
              onError={handleDateError}
            />
          )}
        </FlexRow>
        <FlexRow>
          <h3>
            Approve then select NFTs from your wallet to add to the auction:
          </h3>
        </FlexRow>
        <FlexRow>
          {isApprovedForAll ? (
            <>
              <CheckCircle color="success" />
              NFT listing Approved
            </>
          ) : (
            <Tooltip
              title="Approval only required once"
              placement="right"
              arrow
            >
              <Button
                variant="contained"
                color="error"
                onClick={requestApproveAllNFT}
              >
                Approve Market to list NFTs
              </Button>
            </Tooltip>
          )}
        </FlexRow>
        <FlexRow>
          <FlexColumn>
            <FlexRow>
              {!exceedZoomAllowance && haveEnoughZoomBurn && numberOfSelectedCards > 0 ? (
                <CheckCircle color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
              <div className="zoom-burn-fee">
                Zoom <StyledLogo src={zoomLogo} /> Burn Fee:
                {data && data.zoomBurnFee
                  ? ` ${ethers.utils.formatEther(
                      toBigNumber(data.zoomBurnFee * numberOfSelectedCards)
                    )}`
                  : 0}{' '}
                {currentAllowance !== undefined
                  ? `(Allowance : ${ethers.utils.formatEther(
                      currentAllowance
                    )})`
                  : ''}
              </div>
            </FlexRow>
            {exceedZoomAllowance && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant="h8">Increase ZOOM Allowance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <UserAllowance
                    initial={toBigNumber(
                      data.zoomBurnFee
                        ? data.zoomBurnFee * numberOfSelectedCards
                        : 0
                    )}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </FlexColumn>
        </FlexRow>
        <NFTSelect
          value={selectedNFT}
          onChange={(e) => {
            setSelectedCards({})
            setSelectedNFT(e.target.value)
          }}
        >
          {nftContracts.map((contract) => (
            <MenuItem value={contract.address} key={contract.address}>
              <ListItemIcon>
                <SelectItemImg src={contract.icon}b/>
              </ListItemIcon>
              <ListItemText primary={contract.name} />
            </MenuItem>
          ))}
        </NFTSelect>
        <NFTContainer>
          {isLoading || isLoadingAllowance ? (
            <CircularProgress />
          ) : (
            renderUserNFTs(
              data?.userNFTs,
              wallet?.chainId,
              handleCardClicked,
              selectedCards,
              cardsBeingListed
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
              !haveEnoughZoomBurn ||
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
