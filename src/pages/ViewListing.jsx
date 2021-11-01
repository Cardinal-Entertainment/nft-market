import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styled from "styled-components/macro";
import { store } from "store/store";
import { useHistory, useParams } from "react-router-dom";
import { getAuctionItem } from "utils/auction";
import Card from "components/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {CircularProgress, Modal, Pagination, Paper} from "@mui/material";
import useEventScraper from "hooks/useBidScraper";
import OfferDialog from "components/OfferDialog";
import { marketContractAddress } from "../constants";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import LazyLoad from 'react-lazyload';
import zoomLogo from "../assets/zoombies_logo_round_plaque.svg";
import movrLogo from "../assets/movr_logo.png";
import {getWalletWMOVRBalance, getWalletZoomBalance} from "../utils/wallet";

const Container = styled.div`
  flex: 1;
  height: 100%;

  h1 {
    margin: 0;
  }

  & .pagination-bar {
    padding: 12px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRow = styled(FlexRow)`
  margin-bottom: 10px;

  svg {
    cursor: pointer;
  }

  h1 {
    margin-left: 10px;
  }
`;

const SpacedRow = styled(FlexRow)`
  justify-content: space-between;
`;

const NFTContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;

  max-height: 550px;
  overflow-x: auto;
  border-radius: 8px;
  padding: 5px;

  & > * {
    display: inline-block;
    margin: 0 5px;
  }
`;

const ModalContent = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  & > * {
    margin: 5px 0;
  }
`;

const StyledLogo = styled.img`
  width: 30px;
  padding: 0 5px;
`

const SellerDiv = styled.div`
  padding: 12px;
  display: flex;
  
  
  & div {
    display: flex;
    align-items: center;
    margin: 0 12px;
  }
`

const ViewListing = () => {
  const history = useHistory();
  const { id: auctionId } = useParams();
  const [auctionItem, setAuctionItem] = useState({});
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [bidInProgress, setBidInProgress] = useState(false);
  const [cardPageNo, setCardPageNo] = useState(1);

  const [minIncrement, setMinIncrement] = useState("");
  const [zoomBalance, setZoomBalance] = useState("");
  const [WMOVRBalance, setWMOVRBalance] = useState("");

  const {
    state: { contracts, wallet },
  } = useContext(store);

  const getZoomBalance = async () => {
    const bal = await getWalletZoomBalance(contracts.ZoomContract, wallet.address);
    setZoomBalance(bal);
  };

  const getWMOVRBalance = async () => {
    const bal = await getWalletWMOVRBalance(contracts.WMOVRContract, wallet.address);
    setWMOVRBalance(bal);
  };

  const { offers, refetchOffers } = useEventScraper({
    auctionId,
    currency: auctionItem?.currency,
    MarketContract: contracts.MarketContract,
  });

  const getListingInfo = async () => {
    const auctionItem = await getAuctionItem(
      auctionId,
      contracts.MarketContract,
      contracts.ZoombiesContract
    );

    const minIncrement1 = await contracts.MarketContract.tokenMinIncrement(auctionItem.saleToken)
    setMinIncrement(ethers.utils.formatEther(minIncrement1))
    setAuctionItem(auctionItem)
  };

  const handleConfirmBid = async (amount) => {
    const { currency } = auctionItem;
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

    const weiAmount = ethers.utils.parseEther(`${amount}`);

    const approveTx = await currencyContract.approve(
      marketContractAddress,
      weiAmount
    );
    setApprovalModalOpen(true);
    await approveTx.wait();
    setApprovalModalOpen(false);
    setBidInProgress(true);
    const bidTx = await contracts.MarketContract.bid(
      parseInt(auctionId),
      weiAmount
    );
    await bidTx.wait();
    setBidInProgress(false);
    refetchOffers();
  };

  const handleSettle = async () => {
    const tx = await contracts.MarketContract.settle(parseInt(auctionId));
    await tx.wait();
    history.push("/");
  };

  const handleCardsTablePageChanged = (event, value) => {
    setCardPageNo(value)
  }

  useEffect(() => {
    if (contracts.MarketContract && contracts.ZoombiesContract) {
      getListingInfo();
    }

    if (contracts.ZoomContract && wallet.address) {
      getZoomBalance();

      contracts.ZoomContract.provider.on('block', () => {
        getZoomBalance();
      });
    }
    if (contracts.WMOVRContract && wallet.address) {
      getWMOVRBalance();

      contracts.WMOVRContract.provider.on('block', () => {
        getWMOVRBalance();
      });
    }
  }, [contracts.MarketContract, contracts.ZoombiesContract, contracts.WMOVRContract, contracts.ZoomContract, auctionId]);


  const now = moment().unix();
  const end = moment(auctionItem?.auctionEnd).unix();
  const isOver = end < now;
  const isWinner = auctionItem?.highestBidder === wallet.address;
  const isOwner = wallet.address === auctionItem?.seller;
  const canSettle = isOver && (isWinner || isOwner);

  return (
    <Container>
      <SpacedRow>
        <HeaderRow>
          <FontAwesomeIcon
            icon={faChevronLeft}
            size="2x"
            onClick={() => history.goBack()}
          />
          <h1>Auction #{auctionId}</h1>
        </HeaderRow>
        {canSettle && (
          <Button variant="contained" color="success" onClick={handleSettle}>
            Settle
          </Button>
        )}
      </SpacedRow>
      <SellerDiv>
        <div>
          {'Amount: ' + (auctionItem.minPrice ? auctionItem.minPrice : 0) + ' ' + (auctionItem.currency ? auctionItem.currency : '')}
          {auctionItem.currency === 'ZOOM' ?  <StyledLogo src={zoomLogo}/> : <StyledLogo src={movrLogo} />}
        </div>
        <div>
          {'Seller Wallet: ' + (auctionItem.seller ? auctionItem.seller : '')}
        </div>
        <div>
          {'Date Listed: ' + (auctionItem.created ? auctionItem.created : '')}
        </div>
      </SellerDiv>

      <NFTContainer>
        {auctionItem?.cards ?
          auctionItem.cards.slice((cardPageNo - 1) * 20, cardPageNo * 20).map((card) => (
            <LazyLoad key={card.id} once={true} resize={true}>
              <Card
                key={card.id}
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
            </LazyLoad>
          )) : <CircularProgress/>}
      </NFTContainer>
      {auctionItem.cards && <Pagination count={Math.ceil(auctionItem.cards.length / 20)} className={"pagination-bar"} variant="outlined" shape="rounded" onChange={handleCardsTablePageChanged}/>}


      <SpacedRow>
        <h3>Offers</h3>
        {!isOver && (
          <OfferDialog
            currency={auctionItem?.currency}
            minAmount={parseFloat(auctionItem?.highestBid) > (parseFloat(auctionItem?.minPrice) + parseFloat(minIncrement)) ? parseFloat(auctionItem?.highestBid) : (parseFloat(auctionItem?.minPrice)  + parseFloat(minIncrement))}
            maxAmount={auctionItem?.currency === 'ZOOM' ? parseFloat(zoomBalance) : parseFloat(WMOVRBalance)}
            onConfirm={handleConfirmBid}
            disabled={bidInProgress}
          />
        )}
      </SpacedRow>
      <TableContainer component={Paper} className="bid-table">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.from}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      >
        <ModalContent>
          <div>Please wait for the Approval to complete.</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ViewListing;
