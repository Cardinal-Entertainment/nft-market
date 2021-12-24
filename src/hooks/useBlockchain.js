import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import zoombies_market_place_json from '../contracts/ZoombiesMarketPlace.json'
import zoombies_json from '../contracts/Zoombies.json'
import zoom_token_json from '../contracts/ZoomToken.json'
import wrapped_movr_json from '../contracts/WrappedMovr.json'
import { DAPP_STATES } from 'store/store'
import Actions from 'store/actions'

import {
  zoomContractAddress,
  marketContractAddress,
  wmovrContractAddress,
} from '../constants'
import { getWalletWMOVRBalance, getWalletZoomBalance } from '../utils/wallet'
import watchMarketEvents from 'utils/setupWatcher'

const isLocal = process.env.NODE_ENV === 'development'

const ethChainParam = isLocal
  ? {
      chainId: '0x507', // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
      chainName: 'Moonbase Alpha',
      nativeCurrency: {
        name: 'DEV',
        symbol: 'DEV',
        decimals: 18,
      },
      rpcUrls: [
        'https://moonbase-alpha-api.bwarelabs.com/d6e703e6-a9d9-41bd-ab0a-5b96fae88395',
      ],
      blockExplorerUrls: [
        'https://moonbase-blockscout.testnet.moonbeam.network/',
      ],
    }
  : {
      chainId: '0x505', // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
      chainName: 'Moonriver',
      nativeCurrency: {
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
      blockExplorerUrls: ['https://blockscout.moonriver.moonbeam.network/'],
    }

const loadContracts = async (signer, chainId, dispatch) => {
  const ZoombiesContract = new ethers.Contract(
    zoombies_json.networks[chainId].address,
    zoombies_json.abi,
    signer
  )

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

  const WMOVRContract = new ethers.Contract(
    wmovrContractAddress,
    wrapped_movr_json.abi,
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

  watchMarketEvents(MarketContract, marketContractAddress, ZoombiesContract)

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
  )

  dispatch(
    Actions.walletChanged({
      chainId,
    })
  )

  return {
    ZoomContract,
    ZoombiesContract,
    MarketContract,
    WMOVRContract,
  }
}

export const setupEthers = async (dispatch) => {
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
        params: [ethChainParam],
      })

      const provider = new ethers.providers.Web3Provider(metamaskProvider)

      const signer = provider.getSigner()

      const [address, balance, network] = await Promise.all([
        signer.getAddress(),
        signer.getBalance(),
        provider.getNetwork(),
      ])

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

      const { ZoomContract, WMOVRContract } = await loadContracts(
        signer,
        network.chainId,
        dispatch
      )

      const zoomBalance = await getWalletZoomBalance(ZoomContract, address)
      const WMOVRBalance = await getWalletWMOVRBalance(WMOVRContract, address)

      dispatch(
        Actions.walletChanged({
          zoomBalance: zoomBalance,
          wmovrBalance: WMOVRBalance,
        })
      )
    } else {
      // No metamask detected.
      return
    }
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
  window.ethereum.on('connected', () => handleConnected(dispatch))
  window.ethereum.on('disconnect', () => handleDisconnected(dispatch))
  window.ethereum.on('accountsChanged', (accounts) =>
    handleAccountsChanged(accounts, dispatch)
  )
  window.ethereum.on('chainChanged', (chainId) => {
    window.location.reload()
  })
}
