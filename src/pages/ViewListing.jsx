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
import { CircularProgress, Modal, Paper } from '@mui/material';
import OfferDialog from 'components/OfferDialog';
import {
  EVENT_TYPES,
  marketContractAddress,
  QUERY_KEYS,
  ZoombiesStableEndpoint,
  ZoombiesTestingEndpoint,
} from '../constants';
import { ethers } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import LazyLoad from 'react-lazyload';
import zoomLogo from '../assets/zoombies_coin.svg';
import movrLogo from '../assets/movr_logo.png';
import { styled } from '@mui/material';
import { useFetchBids } from 'hooks/useBids';
import LoadingModal from 'components/LoadingModal';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

const Container = styled('div')({
  flex: 1,
  // height: '100%',
  background: 'white',
  color: '#7e7e7e',
  overflowY: 'auto',
  padding: '12px',

  '& h1': {
    margin: 0,
  },

  '& .pagination-bar': {
    padding: '12px',
  },

  '& .bid-table': {
    flex: 'auto',
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

const FlexWrap = styled('div')({
  display: 'flex',
  flexWrap: 'wrap'
});

const PriceDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  margin: '20px 0',

  '& .price-min': {
    color: '#2169a9'
  },
  '& .price-current': {
    marginTop: '-10px',
    color: '#357439'
  },
});

const StyledLogo = styled('img')({
  width: '30px',
  padding: '0 5px',
});

const SellerDiv = styled('div')(({ theme }) => ({
  padding: '40px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',

  '& .seller-address': {
    marginRight: '12px',
    color: '#313131',
  },

  '& div': {
    display: 'flex',
    // alignItems: 'center',
    // margin: '0 12px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  '.seller-address-link': {
    marginLeft: '8px',
  },

  '& .zoombies-count': {
    fontSize: '24px',
    color: 'black',
    padding: '8px 0'
  }
}));

const ViewListing = () => {
  const history = useHistory();
  const { id } = useParams();
  const [isOnChain, setIsOnChain] = useState(false);
  const [auctionItem, setAuctionItem] = useState({});
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [bidInProgress, setBidInProgress] = useState(false);

  const [minIncrement, setMinIncrement] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auctionId = parseInt(id);

  const {
    state: { contracts, wallet },
  } = useContext(store);
  
  const {
    zoomBalance,
    wmovrBalance
  } = wallet;

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

  useEffect(() => {
    const getListingInfo = async () => {
      const auctionItem = await getAuctionItem(
        auctionId,
        contracts.ZoombiesContract
      );
  
      const minIncrement1 = await contracts.MarketContract.tokenMinIncrement(
        auctionItem.saleToken
      );

      const itemFromChain = await contracts.MarketContract.getListItem(auctionId);
      if (itemFromChain === undefined) {
        setIsOnChain(false)
      } else if (itemFromChain.seller === '0x0000000000000000000000000000000000000000') {
        setIsOnChain(false);
      } else {
        setIsOnChain(true)
      }

      setMinIncrement(ethers.utils.formatEther(minIncrement1));
      setAuctionItem(auctionItem);
      setIsRefreshing(false);
    };

    setIsRefreshing(true);
    if (contracts.MarketContract && contracts.ZoombiesContract) {
      getListingInfo().then(() => {
        setIsRefreshing(false);
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
      const currentBidData = queryClient.getQueryData([
        QUERY_KEYS.bids,
        { auctionId },
      ]);
      const randomId = uuidv4();
      const bidWithId = {
        ...bid,
        _id: randomId,
      };

      if (bid.itemNumber === auctionId) {
        if (currentBidData) {
          queryClient.setQueryData(
            [QUERY_KEYS.bids, { auctionId }],
            [bidWithId, ...currentBidData]
          );
        } else {
          queryClient.setQueryData(
            [QUERY_KEYS.bids, { auctionId }],
            [bidWithId]
          );
        }
      }
    });

    return () => PubSub.unsubscribe(token);
  }, [queryClient, auctionId]);

  const now = moment().unix();
  const end = moment(auctionItem?.auctionEnd * 1000).unix();
  const isOver = end < now;
  const isWinner = auctionItem?.highestBidder === wallet.address;
  const isOwner = wallet.address === auctionItem?.seller;
  const canSettle = isOver && (isWinner || isOwner);
  const sellerURL =
    wallet.chainId === 1287
      ? `${ZoombiesTestingEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`
      : `${ZoombiesStableEndpoint}/my-zoombies-nfts/${auctionItem?.seller}`;

  const { isLoading, data } = useFetchBids(auctionId);

  return (
    <Container>
      <SpacedRow>
        <HeaderRow>
          <FontAwesomeIcon
            icon={faChevronLeft}
            size="2x"
            onClick={() => history.goBack()}
            color="#7e7e7e"
          />
          <h1>Auction #{auctionId}</h1>
        </HeaderRow>
        {canSettle && !isOnChain && (
          <Button variant="contained" color="success" onClick={handleSettle}>
            Settle
          </Button>
        )}
      </SpacedRow>

      <FlexWrap>
        <div>
          <NFTContainer>
            {auctionItem?.tokenIds ? (
              auctionItem.tokenIds
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
        </div>
        <SellerDiv>
          <FlexWrap>
            <div className={"seller-address"}>
              Seller Wallet:
              <a
                className="seller-address-link"
                href={sellerURL}
                rel="noreferrer"
                target="_blank"
              >
                {auctionItem.seller
                  ? `${auctionItem.seller.substr(
                    0,
                    8
                  )}...${auctionItem.seller.substr(36)}`
                  : ''}
              </a>
            </div>
            <div className={"seller-address"}>
              {'Date Listed: ' +
              (new Date(auctionItem.auctionStart * 1000).toLocaleString() ??
                'Unknown')}
            </div>
          </FlexWrap>
          <div className={"zoombies-count"}>
            {
              auctionItem?.tokenIds ?
                (auctionItem.tokenIds.length > 1 ? auctionItem.tokenIds.length + " Zoombies NFTs" : "One Zoombies NFT")
                : 'No Zoombies NFT'}</div>
          <div>
            {'Auction ends ' + (moment.unix(auctionItem.auctionEnd).format("MM/DD/YYYY hh:mm A z"))}
          </div>
          <PriceDiv>
            <div className={"price-min"}>
              {'Minimum Price: ' +
              (auctionItem?.minPrice ? auctionItem.minPrice : 0) +
              ' ' +
              (auctionItem?.currency ? auctionItem.currency : '')}
              {auctionItem.currency === 'ZOOM' ? (
                <StyledLogo src={zoomLogo} />
              ) : (
                <StyledLogo src={movrLogo} />
              )}
            </div>
            <div className={"price-current"}>
              Current Price: {auctionItem?.highestBid} {(auctionItem?.currency ? auctionItem.currency : '')}
            </div>
          </PriceDiv>
          {!isOver && zoomBalance && wmovrBalance && (
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
                  : parseFloat(wmovrBalance)
              }
              onConfirm={handleConfirmBid}
              disabled={bidInProgress}
            />
          )}
        </SellerDiv>
      </FlexWrap>



      <SpacedRow>
        <h3>Item History</h3>
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
                    {moment(bid.timestamp * 1000).format(
                      'MM/DD/YYYY, h:mm:ss A'
                    )}
                  </TableCell>
                  <TableCell>
                    {bid.bidder
                      ? `${bid.bidder.substr(0, 8)} ... ${bid.bidder.substr(
                          36
                        )}`
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
