import { useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import zoombies_market_place_json from '../contracts/ZoombiesMarketPlace.json'
import zoombies_json from '../contracts/Zoombies.json'
import zoom_token_json from '../contracts/ZoomToken.json'
import wrapped_movr_json from '../contracts/WrappedMovr.json'
import { DAPP_STATES, store } from 'store/store'
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

const useBlockchain = () => {
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const { dispatch } = useContext(store)

  useEffect(() => {
    const handleDisconnect = (error) => {
      dispatch(Actions.dAppStateChanged(DAPP_STATES.NOT_CONNECTED))
      dispatch(Actions.walletChanged(null))
    }

    const handleConnect = (connectInfo) => {
      console.log({ connectInfo })
      dispatch(Actions.dAppStateChanged(DAPP_STATES.CONNECTED))
    }

    const handleAccountsChanged = async (zoomContract, wmovrContract) => {
      const metamaskProvider = await detectEthereumProvider({
        mustBeMetaMask: true,
      })

      const provider = new ethers.providers.Web3Provider(metamaskProvider)      
      const signer = provider.getSigner()
      const [address, balance] = await Promise.all([
        signer.getAddress(),
        signer.getBalance(),
      ])

      const [zoomBalance, wmovrBalance] = await Promise.all([
        getWalletZoomBalance(zoomContract, address),
        getWalletWMOVRBalance(wmovrContract, address),
      ])

      provider.on('block', () => {
        provider.getBalance(address).then((balance) => {
          dispatch(
            Actions.walletChanged({
              balance: Number(ethers.utils.formatEther(balance)),
            })
          )
        })
      })

      dispatch(
        Actions.walletChanged({
          address,
          balance: Number(ethers.utils.formatEther(balance)),
          zoomBalance,
          wmovrBalance,
        })
      )
    }

    const loadContracts = async (signer, chainId) => {
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

      // const zoomIncrement = await MarketContract.tokenMinIncrement(zoomContractAddress)
      // const wmovrIncrement = await MarketContract.tokenMinIncrement(wmovrContractAddress)
      //
      // dispatch(Actions.minIncrementUpdated({
      //   zoomIncrement: ethers.utils.formatEther(zoomIncrement),
      //   wmovrIncrement: ethers.utils.formatEther(wmovrIncrement)
      // }))

      ZoomContract.provider.on('block', async () => {
        const address = await signer.getAddress()
        const bal = await getWalletZoomBalance(ZoomContract, address)

        dispatch(
          Actions.walletChanged({
            zoomBalance: bal,
          })
        )
      })

      WMOVRContract.provider.on('block', async () => {
        const address = await signer.getAddress()
        const bal = await getWalletWMOVRBalance(WMOVRContract, address)

        dispatch(
          Actions.walletChanged({
            wmovrBalance: bal,
          })
        )
      })

      watchMarketEvents(MarketContract, marketContractAddress, ZoombiesContract)

      // const settledFilter = MarketContract.filters.Settled()
      // MarketContract.on(
      //   settledFilter,
      //   async (itemNumber, bidAmount, winner, seller, tokenIds, block) => {
      //     const item = await MarketContract.getListItem(itemNumber)
      //     dispatch(
      //       Actions.newBidEventTriggered({
      //         type: 'settled',
      //         timestamp: Date.now() / 1000,
      //         content: {
      //           blockNumber: block.blockNumber,
      //           itemNumber: itemNumber.toNumber(),
      //           bidAmount: ethers.utils.formatEther(bidAmount),
      //           winner: winner,
      //           seller: seller,
      //           currency:
      //             item.saleToken === zoomContractAddress
      //               ? 'ZOOM'
      //               : item.saleToken === wmovrContractAddress
      //               ? 'WMOVR'
      //               : '',
      //         },
      //       })
      //     )
      //   }
      // )

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

    const approveContract = async (address, ZoombiesContract) => {
      const marketIsApproved = await ZoombiesContract.isApprovedForAll(
        address,
        marketContractAddress
      )

      if (!marketIsApproved) {
        setIsApprovalModalOpen(true)
        await ZoombiesContract.setApprovalForAll(marketContractAddress, true)
        setIsApprovalModalOpen(false)
      }
    }

    const setupEthers = async () => {
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

        const { ZoombiesContract, ZoomContract, WMOVRContract } =
          await loadContracts(signer, network.chainId)

        const zoomBalance = await getWalletZoomBalance(ZoomContract, address)
        const WMOVRBalance = await getWalletWMOVRBalance(WMOVRContract, address)

        dispatch(
          Actions.walletChanged({
            zoomBalance: zoomBalance,
            wmovrBalance: WMOVRBalance,
          })
        )

        await approveContract(address, ZoombiesContract)

        window.ethereum.on('connected', handleConnect)
        window.ethereum.on('disconnect', handleDisconnect)
        window.ethereum.on('accountsChanged', () =>
          handleAccountsChanged(ZoomContract, WMOVRContract)
        )
      } else {
        // No metamask detected.
        return
      }
    }

    setupEthers()
  }, [dispatch])

  return {
    selectors: { isApprovalModalOpen },
    actions: { setIsApprovalModalOpen },
  }
}

export default useBlockchain
