import React, { useContext, useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import Button from '@mui/material/Button';
import { store } from 'store/store';
import { useHistory, useParams } from 'react-router-dom';
import { getAuctionItem } from 'utils/auction';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CircularProgress, Modal, Pagination, Paper } from '@mui/material';
import OfferDialog from 'components/OfferDialog';
import { EVENT_TYPES, marketContractAddress, QUERY_KEYS, ZoombiesStableEndpoint, ZoombiesTestingEndpoint } from '../constants';
import { ethers } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import LazyLoad from 'react-lazyload';
import zoomLogo from '../assets/zoombies_coin.svg';
import movrLogo from '../assets/movr_logo.png';
import { getWalletWMOVRBalance, getWalletZoomBalance } from '../utils/wallet';
import { styled, Grid } from '@mui/material';
import { useFetchBids } from 'hooks/useBids';
import LoadingModal from 'components/LoadingModal';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

const Container = styled('div')({
  flex: 1,
  height: '100%',
  color: 'white',

  '& h1': {
    margin: 0,
  },

  '& .pagination-bar': {
    padding: '12px',
  },
});

const FlexRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const HeaderRow = styled(FlexRow)({
  marginBottom: '10px',
  '& svg': {
    cursor: 'pointer',
  },

  '& h1': {
    marginLeft: '10px',
  },
});

const SpacedRow = styled(FlexRow)({
  justifyContent: 'space-between',
});

const NFTContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',

  maxHeight: '550px',
  overflowX: 'auto',
  borderRadius: '8px',
  padding: '5px',

  '& > *': {
    display: 'inline-block',
    margin: '0 5px',
  },
  '& img': {
    width: '175px',
  },
});

const ModalContent = styled('div')({
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  background: 'white',
  borderRadius: '8px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  '& > *': {
    margin: '5px 0',
  },
});

const StyledLogo = styled('img')({
  width: '30px',
  padding: '0 5px',
});

const SellerDiv = styled(Grid)(({ theme }) => ({
  padding: '12px',
  display: 'flex',

  '& div': {
    display: 'flex',
    alignItems: 'center',
    margin: '0 12px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  '.seller-address-link': {
    marginLeft: '8px'
  }
}));

const ViewListing = () => {
  const history = useHistory();
  const { id } = useParams();
  const [auctionItem, setAuctionItem] = useState({});
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [bidInProgress, setBidInProgress] = useState(false);
  const [cardPageNo, setCardPageNo] = useState(1);

  const [minIncrement, setMinIncrement] = useState('');
  const [zoomBalance, setZoomBalance] = useState('');
  const [WMOVRBalance, setWMOVRBalance] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auctionId = parseInt(id);
  
  const {
    state: { contracts, wallet },
  } = useContext(store);

  const getZoomBalance = async () => {
    const bal = await getWalletZoomBalance(
      contracts.ZoomContract,
      wallet.address
    );
    setZoomBalance(bal);
  };

  const getWMOVRBalance = async () => {
    const bal = await getWalletWMOVRBalance(
      contracts.WMOVRContract,
      wallet.address
    );
    setWMOVRBalance(bal);
  };

  const getListingInfo = async () => {
    const auctionItem = await getAuctionItem(
      auctionId,
      contracts.ZoombiesContract
    );

    const minIncrement1 = await contracts.MarketContract.tokenMinIncrement(
      auctionItem.saleToken
    );
    setMinIncrement(ethers.utils.formatEther(minIncrement1));
    setAuctionItem(auctionItem);
    setIsRefreshing(false);
  };

  const handleConfirmBid = async (amount) => {
    const { currency, id } = auctionItem;
    let currencyContract;

    if (
      parseFloat(amount) <
      Math.max(
        auctionItem?.highestBid + parseFloat(minIncrement),
        auctionItem?.minAmount + parseFloat(minIncrement)
      )
    ) {
      throw new Error(`Invalid amount valid : ${amount}`);
    }

    switch (currency) {
      case 'ZOOM':
        currencyContract = contracts.ZoomContract;
        break;
      case 'WMOVR':
        currencyContract = contracts.WMOVRContract;
        break;
      default:
        throw new Error(`Unhandled currency type: ${currency}`);
    }

    const weiAmount = ethers.utils.parseEther(amount.toString());

    const approveTx = await currencyContract.approve(
      marketContractAddress,
      weiAmount
    );
    setApprovalModalOpen(true);
    await approveTx.wait();
    setApprovalModalOpen(false);
    setBidInProgress(true);
    const bidTx = await contracts.MarketContract.bid(parseInt(id), weiAmount);
    await bidTx.wait();
    setBidInProgress(false);
    //getOffers();
  };

  const handleSettle = async () => {
    const tx = await contracts.MarketContract.settle(parseInt(auctionId));
    await tx.wait();
    history.push('/');
  };

  const handleCardsTablePageChanged = (event, value) => {
    setCardPageNo(value);
  };

  useEffect(() => {
    setIsRefreshing(true);
    if (contracts.MarketContract && contracts.ZoombiesContract) {
      getListingInfo().then(() => {
        setIsRefreshing(false);
      });
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
  }, [
    contracts.MarketContract,
    contracts.ZoombiesContract,
    contracts.WMOVRContract,
    contracts.ZoomContract,
    auctionId,
  ]);

  const queryClient = useQueryClient();
  useEffect(() => {
    const token = PubSub.subscribe(EVENT_TYPES.Bid, (msg, data) => {
      const bid = data;
      const currentBidData = queryClient.getQueryData([QUERY_KEYS.bids, { auctionId }]);
      const randomId = uuidv4();
      const bidWithId = {
        ...bid,
        _id: randomId
      }
      
      if (bid.itemNumber === auctionId) {
        if (currentBidData) {
          queryClient.setQueryData([QUERY_KEYS.bids, {auctionId}], [bidWithId, ...currentBidData]);
        } else {
          queryClient.setQueryData([QUERY_KEYS.bids, {auctionId}], [bidWithId]);
        }
      }
    });

    return () => PubSub.unsubscribe(token);
  }, [queryClient, auctionId])

  const now = moment().unix();
  const end = moment(auctionItem?.auctionEnd * 1000).unix();
  const isOver = end < now;
  const isWinner = auctionItem?.highestBidder === wallet.address;
  const isOwner = wallet.address === auctionItem?.seller;
  const canSettle = isOver && (isWinner || isOwner);
  const sellerURL = wallet.chainId === 1287 ? 
    `${ZoombiesTestingEndpoint}/my-zoombies-nfts/${auctionItem?.seller}` : `${ZoombiesStableEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`;

  const { isLoading, data } = useFetchBids(auctionId);

  return (
    <Container>
      <SpacedRow>
        <HeaderRow>
          <FontAwesomeIcon
            icon={faChevronLeft}
            size="2x"
            onClick={() => history.goBack()}
            color="white"
          />
          <h1>Auction #{auctionId}</h1>
        </HeaderRow>
        {canSettle && (
          <Button variant="contained" color="success" onClick={handleSettle}>
            Settle
          </Button>
        )}
      </SpacedRow>
      <SellerDiv container>
        <Grid item>
          {'Amount: ' +
            (auctionItem?.minPrice ? auctionItem.minPrice : 0) +
            ' ' +
            (auctionItem?.currency ? auctionItem.currency : '')}
          {auctionItem.currency === 'ZOOM' ? (
            <StyledLogo src={zoomLogo} />
          ) : (
            <StyledLogo src={movrLogo} />
          )}
        </Grid>
        <Grid item>
          Seller Wallet:
          <a className="seller-address-link" href={sellerURL} rel="noreferrer" target="_blank">
            {auctionItem.seller
              ? `${auctionItem.seller.substr(
                  0,
                  8
                )}...${auctionItem.seller.substr(36)}`
              : ''}
          </a>
        </Grid>
        <Grid item>
          {'Date Listed: ' +
            (new Date(auctionItem.auctionStart * 1000).toLocaleString() ??
              'Unknown')}
        </Grid>
      </SellerDiv>

      <NFTContainer>
        {auctionItem?.tokenIds ? (
          auctionItem.tokenIds
            .slice((cardPageNo - 1) * 20, cardPageNo * 20)
            .map((tokenId) => (
              <LazyLoad key={tokenId} once={true} resize={true}>
                <img
                  src={`https://moonbase.zoombies.world/nft-image/${tokenId}`}
                  alt={`Token #${tokenId}`}
                  loading="lazy"
                />
              </LazyLoad>
            ))
        ) : (
          <CircularProgress />
        )}
      </NFTContainer>
      {auctionItem.tokenIds && (
        <Pagination
          count={Math.ceil(auctionItem.tokenIds.length / 20)}
          className={'pagination-bar'}
          variant="outlined"
          shape="rounded"
          onChange={handleCardsTablePageChanged}
        />
      )}
      <SpacedRow>
        <h3>Offers</h3>
        {!isOver && (
          <OfferDialog
            currency={auctionItem?.currency}
            minAmount={
              Math.max(
                parseFloat(auctionItem?.highestBid),
                parseFloat(auctionItem?.minPrice)
              ) + parseFloat(minIncrement)
            }
            maxAmount={
              auctionItem?.currency === 'ZOOM'
                ? parseFloat(zoomBalance)
                : parseFloat(WMOVRBalance)
            }
            onConfirm={handleConfirmBid}
            disabled={bidInProgress}
          />
        )}
      </SpacedRow>
      {isLoading ? (
        <LoadingModal text="Loading bids..." open={isLoading} />
      ) : (
        <TableContainer component={Paper} className="bid-table">
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Amount</TableCell>
                {/* <TableCell>Currency</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((bid) => (
                <TableRow
                  key={bid._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    {moment(bid.timestamp * 1000).format('MM/DD/YYYY, h:mm:ss A')}
                  </TableCell>
                  <TableCell>
                    {bid.bidder
                      ? `${bid.bidder.substr(0, 8)} ... ${bid.bidder.substr(36)}`
                      : ''}
                  </TableCell>
                  <TableCell>{bid.bidAmount}</TableCell>
                  {/* <TableCell>{row.status}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      >
        <ModalContent>
          <div>Please wait for the Approval to complete.</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
      <Modal open={isRefreshing}>
        <ModalContent>
          <div>Loading content.</div>
          <CircularProgress />
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ViewListing;
