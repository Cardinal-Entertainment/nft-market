import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import zoombies_market_place_json from '../contracts/ZoombiesMarketPlace.json'
// import zoombies_json from '../contracts/Zoombies.json'
import anyNFTJson from '../contracts/AnyNFT.json'
import zoom_token_json from '../contracts/ZoomToken.json'
import wrapped_movr_json from '../contracts/WrappedMovr.json'
import anyERC20JSON from '../contracts/AnyERC20.json'
import { DAPP_STATES } from 'store/store'
import Actions from 'store/actions'

import {
  zoomContractAddress,
  marketContractAddress,
  wmovrContractAddress,
  usdtContractAddress,
  daiContractAddress,
  gNFTAddresses,
} from '../constants'
import {
  getWalletUSDTBalance,
  getWalletWMOVRBalance,
  getWalletZoomBalance,
  getWalletDAIBalance,
} from '../utils/wallet'
import watchMarketEvents from 'utils/setupWatcher'
import { isLocal } from '../constants'
import WebsocketProvider from 'utils/WebsocketProvider'

const devChainParam = {
  chainId: '0x507', // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
  chainName: 'Moonbase Alpha',
  nativeCurrency: {
    name: 'DEV',
    symbol: 'DEV',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
  blockExplorerUrls: ['https://moonbase.moonscan.io/'],
}

const prodChainParam = {
  chainId: '0x505', // Moonriver's chainId is 1285, which is 0x505 in hex
  chainName: 'Moonriver',
  nativeCurrency: {
    name: 'MOVR',
    symbol: 'MOVR',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
  blockExplorerUrls: ['https://moonriver.moonscan.io/'],
}

const loadContracts = async (signer, chainId, dispatch, websocketProvider) => {
  let nftContracts = {}

  for (const nft of gNFTAddresses) {
    const contract = new ethers.Contract(
      nft.address,
      nft.abiJSON ? nft.abiJSON.abi : anyNFTJson.abi,
      signer
    )

    const readOnlyContract = new ethers.Contract(
      nft.address,
      nft.abiJSON ? nft.abiJSON.abi : anyNFTJson.abi,
      websocketProvider
    )

    nftContracts[nft.address] = {
      signed: contract,
      readOnly: readOnlyContract,
    }
  }

  const ZoomContract = new ethers.Contract(
    zoomContractAddress,
    zoom_token_json.abi,
    signer
  )

  const MarketContract = new ethers.Contract(
    marketContractAddress,
    zoombies_market_place_json.abi,
    signer
  )

  const ReadOnlyMarketContract = new ethers.Contract(
    marketContractAddress,
    zoombies_market_place_json.abi,
    websocketProvider
  )

  const WMOVRContract = new ethers.Contract(
    wmovrContractAddress,
    wrapped_movr_json.abi,
    signer
  )

  const USDTContract = new ethers.Contract(
    usdtContractAddress,
    wrapped_movr_json.abi,
    signer
  )

  const DAIContract = new ethers.Contract(
    daiContractAddress,
    anyERC20JSON.abi,
    signer
  )

  ZoomContract.provider.on('block', async () => {
    if (signer) {
      const address = await signer.getAddress()
      const bal = await getWalletZoomBalance(ZoomContract, address)

      dispatch(
        Actions.walletChanged({
          zoomBalance: bal,
        })
      )
    } else {
      dispatch(
        Actions.walletChanged({
          zoomBalance: 0,
        })
      )
    }
  })

  WMOVRContract.provider.on('block', async () => {
    if (signer) {
      const address = await signer.getAddress()
      const bal = await getWalletWMOVRBalance(WMOVRContract, address)

      dispatch(
        Actions.walletChanged({
          wmovrBalance: bal,
        })
      )
    } else {
      dispatch(
        Actions.walletChanged({
          wmovrBalance: 0,
        })
      )
    }
  })

  USDTContract.provider.on('block', async () => {
    if (signer) {
      const address = await signer.getAddress()
      const bal = await getWalletUSDTBalance(USDTContract, address)

      dispatch(
        Actions.walletChanged({
          usdtBalance: bal,
        })
      )
    } else {
      dispatch(
        Actions.walletChanged({
          usdtBalance: 0,
        })
      )
    }
  })

  DAIContract.provider.on('block', async () => {
    if (signer) {
      const address = await signer.getAddress()
      const bal = await getWalletDAIBalance(DAIContract, address)

      dispatch(
        Actions.walletChanged({
          daiBalance: bal,
        })
      )
    } else {
      dispatch(
        Actions.walletChanged({
          daiBalance: 0,
        })
      )
    }
  })

  await watchMarketEvents(
    websocketProvider,
    marketContractAddress,
    nftContracts
  )

  dispatch(
    Actions.contractsLoaded({
      contracts: {
        ZoomContract,
        MarketContract,
        ReadOnlyMarketContract,
        WMOVRContract,
        USDTContract,
        DAIContract,
        nftContracts,
      },
      signer: signer,
    })
  )

  dispatch(
    Actions.walletChanged({
      chainId,
    })
  )

  return {
    ZoomContract,
    MarketContract,
    WMOVRContract,
    USDTContract,
    DAIContract,
    nftContracts,
  }
}

const setupMetamask = async () => {
  try {
    const metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    })

    if (metamaskProvider) {
      await metamaskProvider.request({
        method: 'eth_requestAccounts',
      })
      await metamaskProvider.request({
        method: 'wallet_addEthereumChain',
        params: [isLocal ? devChainParam : prodChainParam],
      })

      const etherWrapper = new ethers.providers.Web3Provider(window.ethereum)
      await etherWrapper.send('eth_requestAccounts', [])

      const signer = etherWrapper.getSigner()

      const [address, balance, network] = await Promise.all([
        signer.getAddress(),
        signer.getBalance(),
        etherWrapper.getNetwork(),
      ])

      return {
        address,
        balance,
        network,
        signer,
        provider: metamaskProvider,
      }
    }
  } catch (error) {
    console.error('Failed to init metamask provider: ', error)
  }
}

export const setupEthers = async (dispatch) => {
  try {
    const metamaskProviderData = await setupMetamask()
    if (!metamaskProviderData) {
      return
    }

    const { address, balance, network, signer, provider } = metamaskProviderData

    dispatch(
      Actions.walletChanged({
        address: address,
        balance: Number(ethers.utils.formatEther(balance)),
        chainId: network.chainId,
      })
    )
    dispatch(Actions.dAppStateChanged(DAPP_STATES.WALLET_CONNECTED))

    dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED))

    provider.on('block', () => {
      provider.getBalance(address).then((balance) => {
        dispatch(
          Actions.walletChanged({
            balance: Number(ethers.utils.formatEther(balance)),
          })
        )
      })
    })

    const websocketProvider = new WebsocketProvider(isLocal, (provider) => {
      loadContracts(signer, network.chainId, dispatch, provider)
    })

    websocketProvider.init()

    const { ZoomContract, WMOVRContract, USDTContract, DAIContract } =
      await loadContracts(
        signer,
        network.chainId,
        dispatch,
        websocketProvider.provider
      )

    const zoomBalance = await getWalletZoomBalance(ZoomContract, address)
    const WMOVRBalance = await getWalletWMOVRBalance(WMOVRContract, address)
    const usdtBalance = await getWalletUSDTBalance(USDTContract, address)
    const daiBalance = await getWalletDAIBalance(DAIContract, address)

    dispatch(
      Actions.walletChanged({
        zoomBalance: zoomBalance,
        wmovrBalance: WMOVRBalance,
        usdtBalance: usdtBalance,
        daiBalance: daiBalance,
      })
    )
  } catch (err) {
    console.error('Failed to setup ether', err)
  }
}

const handleConnected = (dispatch) => {
  dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED))
}

const handleAccountsChanged = async (accounts, dispatch) => {
  if (!accounts || accounts.length === 0) {
    dispatch(Actions.dAppStateChanged(DAPP_STATES.NOT_CONNECTED))
    dispatch(Actions.clearWallet())
    window.location.replace('/')
  } else {
    await setupEthers(dispatch)
  }
}

const handleDisconnected = (dispatch) => {
  dispatch(Actions.dAppStateChanged(DAPP_STATES.NOT_CONNECTED))
  dispatch(Actions.walletChanged(null))
}

export const setupEthListeners = (dispatch) => {
  if (window.ethereum) {
    window.ethereum.on('connected', () => handleConnected(dispatch))
    window.ethereum.on('disconnect', () => handleDisconnected(dispatch))
    window.ethereum.on('accountsChanged', (accounts) =>
      handleAccountsChanged(accounts, dispatch)
    )
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })
  }
}
