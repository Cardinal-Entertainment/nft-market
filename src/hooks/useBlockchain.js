import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import zoombies_market_place_json from '../contracts/ZoombiesMarketPlace.json'
import zoom_token_json from '../contracts/ZoomToken.json'
import wrapped_movr_json from '../contracts/WrappedMovr.json'
import anyERC20JSON from '../contracts/AnyERC20.json'
import { DAPP_STATES } from 'store/store'
import Actions from 'store/actions'

import { NFT_CONTRACTS, NETWORKS, METAMASK_CHAIN_PARAMS } from '../constants'
import {
  getWalletUSDTBalance,
  getWalletWMOVRBalance,
  getWalletZoomBalance,
  getWalletDAIBalance,
} from '../utils/wallet'
import watchMarketEvents from 'utils/setupWatcher'
import WebsocketProvider from 'utils/WebsocketProvider'

const loadContracts = async (
  signer,
  dispatch,
  websocketProvider,
  chainName = 'moonbase-alpha'
) => {
  const network = NETWORKS[chainName]
  const nftContracts = {}

  for (const contract of NFT_CONTRACTS[chainName]) {
    const signedContract = new ethers.Contract(
      contract.address,
      contract.abiJSON.abi,
      signer
    )

    const readOnlyContract = new ethers.Contract(
      contract.address,
      contract.abiJSON.abi,
      websocketProvider
    )

    nftContracts[contract.address] = {
      signed: signedContract,
      readOnly: readOnlyContract,
    }
  }

  const ZoomContract = new ethers.Contract(
    network.zoomContractAddress,
    zoom_token_json.abi,
    signer
  )

  const MarketContract = new ethers.Contract(
    network.marketContractAddress,
    zoombies_market_place_json.abi,
    signer
  )

  const ReadOnlyMarketContract = new ethers.Contract(
    network.marketContractAddress,
    zoombies_market_place_json.abi,
    websocketProvider
  )

  const WMOVRContract = new ethers.Contract(
    network.wmovrContractAddress,
    wrapped_movr_json.abi,
    signer
  )

  const USDTContract = new ethers.Contract(
    network.usdtContractAddress,
    wrapped_movr_json.abi,
    signer
  )

  const DAIContract = new ethers.Contract(
    network.daiContractAddress,
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
    network.marketContractAddress,
    nftContracts,
    chainName
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

  return {
    ZoomContract,
    MarketContract,
    WMOVRContract,
    USDTContract,
    DAIContract,
    nftContracts,
  }
}

const setupMetamask = async (chainName = 'moonbase-alpha') => {
  try {
    const metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    })

    if (metamaskProvider) {
      const metamaskParam = METAMASK_CHAIN_PARAMS[chainName]

      await metamaskProvider.request({
        method: 'eth_requestAccounts',
      })
      await metamaskProvider.request({
        method: 'wallet_addEthereumChain',
        params: [metamaskParam],
      })

      const etherWrapper = new ethers.providers.Web3Provider(window.ethereum)
      await etherWrapper.send('eth_requestAccounts', [])

      const signer = etherWrapper.getSigner()

      const [address, balance] = await Promise.all([
        signer.getAddress(),
        signer.getBalance(),
      ])

      return {
        address,
        balance,
        network: NETWORKS[chainName],
        signer,
        provider: metamaskProvider,
      }
    }
  } catch (error) {
    console.error('Failed to init metamask provider: ', error)
  }
}

export const setupEthers = async (dispatch, chainName = 'moonbase-alpha') => {
  try {
    if (!(chainName in NETWORKS)) {
      return
    }

    const metamaskProviderData = await setupMetamask(chainName)
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

    const websocketUrl = NETWORKS[chainName].websocketRPC
    const websocketProvider = new WebsocketProvider(
      websocketUrl,
      (provider) => {
        loadContracts(signer, dispatch, provider)
      }
    )

    websocketProvider.init()

    const { ZoomContract, WMOVRContract, USDTContract, DAIContract } =
      await loadContracts(signer, dispatch, websocketProvider.provider)

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
