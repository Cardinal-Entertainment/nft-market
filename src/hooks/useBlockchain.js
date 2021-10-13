import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

import zoombies_market_place_json from "../contracts/ZoombiesMarketPlace.json";
import zoombies_json from "../contracts/Zoombies.json";
import zoom_token_json from "../contracts/ZoomToken.json";
import wrapped_movr_json from "../contracts/WrappedMovr.json";
import { DAPP_STATES, store } from "store/store";
import Actions from "store/actions";
// import global_json from "../contracts/Global.json";

const zoombiesContractAddress = "0x3E7997B8D30AA6216102fb2e9206246e478d57d3";
const marketContractAddress = "0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7";
const zoomContractAddress = "0x8e21404bAd3A1d2327cc6D2B2118f47911a1f316";
const wmovrContractAddress = "0x372d0695E75563D9180F8CE31c9924D7e8aaac47";

const isLocal = process.env.NODE_ENV === "development";

const ethChainParam = isLocal
  ? {
      chainId: "0x507", // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
      chainName: "Moonbase Alpha",
      nativeCurrency: {
        name: "DEV",
        symbol: "DEV",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.testnet.moonbeam.network"],
      blockExplorerUrls: [
        "https://moonbase-blockscout.testnet.moonbeam.network/",
      ],
    }
  : {
      chainId: "0x505", // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
      chainName: "Moonriver",
      nativeCurrency: {
        name: "MOVR",
        symbol: "MOVR",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.moonriver.moonbeam.network"],
      blockExplorerUrls: ["https://blockscout.moonriver.moonbeam.network/"],
    };

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

  const loadContracts = (signer, chainId) => {
    const ZoombiesContract = new ethers.Contract(
      zoombies_json.networks[chainId].address,
      zoombies_json.abi,
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
        contracts: {
          ZoomContract,
          ZoombiesContract,
          MarketContract,
          WMOVRContract,
          GlobalContract: null,
        },
        signer: signer,
      })
    );

    dispatch(
      Actions.walletChanged({
        chainId,
      })
    );

    return {
      ZoomContract,
      ZoombiesContract,
      MarketContract,
    };
  };

  const approveContract = async (address, ZoombiesContract) => {
    const marketIsApproved = await ZoombiesContract.isApprovedForAll(
      address,
      marketContractAddress
    );

    if (!marketIsApproved) {
      setIsApprovalModalOpen(true);
      await ZoombiesContract.setApprovalForAll(marketContractAddress, true);
      setIsApprovalModalOpen(false);
    }
  };

  const setupEthers = async () => {
    const metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });

    if (metamaskProvider) {
      await metamaskProvider.request({
        method: "wallet_addEthereumChain",
        params: [ethChainParam],
      });

      const provider = new ethers.providers.Web3Provider(metamaskProvider);

      window.ethereum.on("connected", handleConnect);
      window.ethereum.on("disconnect", handleDisconnect);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED));
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const [balance, networkId] = await Promise.all([
        provider.getBalance(address),
        provider.getNetwork(),
      ]);

      dispatch(
        Actions.walletChanged({
          address,
          balance: balance / 1000000000000000000,
          chainId: networkId.chainId,
        })
      );
      dispatch(Actions.dAppStateChanged(DAPP_STATES.WALLET_CONNECTED));
      const { ZoombiesContract } = loadContracts(signer, networkId.chainId);

      approveContract(address, ZoombiesContract);
    } else {
      // No metamask detected.
      return;
    }

    // // Get a list itemCount
    // const itemCount = await MarketContract.itemCount();
    // console.log("market items:", itemCount.toString());

    // // Get listItem - tokenIds are the nftIds - https://zoombies.world/nft/19205
    // const item = await MarketContract.getListItem(0);
    // console.log(
    //   item,
    //   item.auctionEnd.toString(),
    //   item.minPrice.toString(),
    //   item.saleToken,
    //   item.seller,
    //   item.highestBidder,
    //   item.highestBid.toString(),
    //   item.tokenIds
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
