import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

import zoombies_market_place_json from "../contracts/ZoombiesMarketPlace.json";
import zoombies_nft_json from "../contracts/ZoombiesNFT.json";
import zoom_token_json from "../contracts/ZoomToken.json";
import wrapped_movr_json from "../contracts/WrappedMovr.json";
import { DAPP_STATES, store } from "store/store";
import Actions from "store/actions";
// import global_json from "../contracts/Global.json";

const marketContractAddress = "0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7";
const zoomContractAddress = "0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316";
const zoombiesContractAddress = "0x3E7997B8D30AA6216102fb2e9206246e478d57d3";
const wmovrContractAddress = "0x372d0695E75563D9180F8CE31c9924D7e8aaac47";

const useBlockchain = () => {
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const { dispatch } = useContext(store);

  const handleDisconnect = (error) => {
    dispatch(Actions.dAppStateChanged(DAPP_STATES.NOT_CONNECTED));
    dispatch(Actions.walletChanged(null));
  };

  const handleConnect = (connectInfo) => {
    console.log({ connectInfo });
    dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED));
  };

  const handleAccountsChanged = (accounts) => {
    dispatch(Actions.walletChanged(accounts[0]));
  };

  const handleChainChanged = (chainId) => {};

  const loadContracts = (signer) => {
    const ZoombiesContract = new ethers.Contract(
      zoombiesContractAddress,
      zoombies_nft_json.abi,
      signer
    );

    const ZoomContract = new ethers.Contract(
      zoomContractAddress,
      zoom_token_json.abi,
      signer
    );

    const MarketContract = new ethers.Contract(
      marketContractAddress,
      zoombies_market_place_json.abi,
      signer
    );

    const WMOVRContract = new ethers.Contract(
      wmovrContractAddress,
      wrapped_movr_json.abi,
      signer
    );

    dispatch(
      Actions.contractsLoaded({
        ZoomContract,
        ZoombiesContract,
        MarketContract,
        WMOVRContract,
        GlobalContract: null,
      })
    );

    return {
      ZoomContract,
      ZoombiesContract,
      MarketContract,
    };
  };

  const approveContract = async (signerAddress, ZoombiesContract) => {
    const marketIsApproved = await ZoombiesContract.isApprovedForAll(
      signerAddress,
      marketContractAddress
    );

    console.log("marketIsApproved", marketIsApproved);
    if (!marketIsApproved) {
      setIsApprovalModalOpen(true);
      await ZoombiesContract.setApprovalForAll(
        "0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7",
        true
      );
      setIsApprovalModalOpen(false);
    }
  };

  const setupEthers = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    if (!window.ethereum) {
      return;
    }

    window.ethereum.on("connected", handleConnect);
    window.ethereum.on("disconnect", handleDisconnect);
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED));
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    dispatch(Actions.walletChanged(signerAddress));
    dispatch(Actions.dAppStateChanged(DAPP_STATES.WALLET_CONNECTED));

    const { ZoomContract, ZoombiesContract, MarketContract } =
      loadContracts(signer);

    approveContract(signerAddress, ZoombiesContract);

    //Get a list itemCount
    // const itemCount = await MarketContract.itemCount();
    // console.log("market items:", itemCount.toString());

    // //get listItem
    // const item = await MarketContract.Items(2);
    // console.log(
    //   "Item2:",
    //   item,
    //   item.auctionEnd.toString(),
    //   item.minPrice.toString(),
    //   item.saleToken,
    //   item.seller,
    //   item.tokenIds,
    //   item.highestBidder,
    //   item.highestBid.toString()
    // );
  };

  useEffect(() => {
    setupEthers();
  }, []);

  return {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  };
};

export default useBlockchain;
