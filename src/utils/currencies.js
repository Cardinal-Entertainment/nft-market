import { NETWORKS, CURRENCY_TYPES } from '../constants'
import { ethers } from 'ethers'
import { waitForTransaction } from './transactions'

export const getNotEnoughCurrencyTooltip = (
  coinType,
  wallet,
  minOfferAmount
) => {
  if (coinType === 'ZOOM') {
    if (
      wallet.zoomBalance &&
      ethers.utils.parseEther(wallet.zoomBalance).lt(minOfferAmount)
    ) {
      return 'You do not have enough ZOOM tokens'
    }
  }

  if (coinType === 'MOVR') {
    if (
      wallet.balance &&
      ethers.utils.parseEther(wallet.balance.toString()).lt(minOfferAmount)
    ) {
      return 'You do not have enough MOVR'
    }
  }

  if (coinType === 'USDT') {
    if (
      wallet.usdtBalance &&
      ethers.utils.parseEther(wallet.usdtBalance.toString()).lt(minOfferAmount)
    ) {
      return 'You do not have enough USDT'
    }
  }

  if (coinType === 'DAI') {
    if (
      wallet.daiBalance &&
      ethers.utils.parseEther(wallet.daiBalance.toString()).lt(minOfferAmount)
    ) {
      return 'You do not have enough DAI'
    }
  }

  if (coinType === 'USDC') {
    if (
      wallet.usdcBalance &&
      parseInt(wallet.usdcBalance) <=
        parseInt(ethers.utils.formatEther(minOfferAmount))
    ) {
      return 'You do not have enough USDC'
    }
  }

  return null
}

export const getTokenMinIncrement = (saleToken, network, state) => {
  const {
    zoomIncrement,
    wmovrIncrement,
    usdtIncrement,
    daiIncrement,
    usdcIncrement,
  } = state

  switch (saleToken) {
    case NETWORKS[network].zoomContractAddress:
      return zoomIncrement
    case NETWORKS[network].wmovrContractAddress:
      return wmovrIncrement
    case NETWORKS[network].usdtContractAddress:
      return usdtIncrement
    case NETWORKS[network].daiContractAddress:
      return daiIncrement
    case NETWORKS[network].usdcContractAddress:
      return usdcIncrement
    default:
      return 0
  }
}

export const getCurrencyAddress = (network, currency) => {
  const networkAddresses = NETWORKS[network]

  switch (currency) {
    case CURRENCY_TYPES.MOVR:
      return networkAddresses.wmovrContractAddress
    case CURRENCY_TYPES.DAI:
      return networkAddresses.daiContractAddress
    case CURRENCY_TYPES.ZOOM:
      return networkAddresses.zoomContractAddress
    case CURRENCY_TYPES.USDC:
      return networkAddresses.usdcContractAddress
    // case CURRENCY_TYPES.USDT:
    //   return networkAddresses.usdtContractAddress
    default:
      return null
  }
}

export const getTokenNameFromAddress = (saleToken, network) => {
  switch (saleToken) {
    case NETWORKS[network].zoomContractAddress:
      return CURRENCY_TYPES.ZOOM
    case NETWORKS[network].wmovrContractAddress:
      return CURRENCY_TYPES.MOVR
    case NETWORKS[network].usdtContractAddress:
      return 'USDT'
    case NETWORKS[network].daiContractAddress:
      return CURRENCY_TYPES.DAI
    case NETWORKS[network].usdcContractAddress:
      return CURRENCY_TYPES.USDC
    default:
      return null
  }
}

export const getTokenContract = (saleToken, network, contracts) => {
  switch (saleToken) {
    case NETWORKS[network].daiContractAddress:
      return contracts.DAIContract
    case NETWORKS[network].usdcContractAddress:
      return contracts.USDCContract
    default:
      return null
  }
}

export const approveTokenContractAmount = async (
  tokenContract,
  marketAddress,
  weiAmount
) => {
  const approveTx = await tokenContract.approve(marketAddress, weiAmount)
  await waitForTransaction(approveTx)
}

export const getWalletBalance = (wallet, coinType) => {
  if (!wallet) return null
  switch (coinType) {
    case CURRENCY_TYPES.ZOOM:
      if (wallet.zoomBalance) {
        return ethers.utils.parseEther(wallet.zoomBalance.toString())
      }
      return null
    case CURRENCY_TYPES.USDC:
      if (wallet.usdcBalance) {
        return ethers.utils.parseEther(wallet.usdcBalance.toString())
      }
      return null
    case CURRENCY_TYPES.DAI:
      if (wallet.daiBalance) {
        return ethers.utils.parseEther(wallet.daiBalance.toString())
      }
      return null

    case CURRENCY_TYPES.MOVR:
      if (wallet.balance) {
        return ethers.utils.parseEther(wallet.balance.toString())
      }
      return null
    default:
      return null
  }
}

export const isWalletBalanceEnough = (coinType, wallet, minOffer) => {
  switch (coinType) {
    case CURRENCY_TYPES.ZOOM:
      return (
        !!wallet.zoomBalance &&
        ethers.utils.parseEther(wallet.zoomBalance.toString()).gt(minOffer)
      )
    case CURRENCY_TYPES.USDC:
      return (
        !!wallet.usdcBalance &&
        parseInt(wallet.usdcBalance) >
          parseInt(ethers.utils.formatEther(minOffer))
      )
    case CURRENCY_TYPES.DAI:
      return (
        !!wallet.daiBalance &&
        ethers.utils.parseEther(wallet.daiBalance.toString()).gt(minOffer)
      )
    case CURRENCY_TYPES.MOVR:
      return (
        !!wallet.balance &&
        ethers.utils.parseEther(wallet.balance.toString()).gt(minOffer)
      )
    default:
      return false
  }
}

export const formatBigNumberAmount = (amount, saleToken, network) => {
  switch (saleToken) {
    case NETWORKS[network].usdtContractAddress:
    case NETWORKS[network].usdcContractAddress:
      return ethers.utils.formatUnits(amount, 'mwei')
    default:
      return ethers.utils.formatEther(amount)
  }
}

export const parseAmountToBigNumber = (amount, saleToken, network) => {
  switch (saleToken) {
    case NETWORKS[network].usdtContractAddress:
    case NETWORKS[network].usdcContractAddress:
      return ethers.utils.parseUnits(amount.toString(), 'mwei')
    default:
      return ethers.utils.parseEther(amount.toString())
  }
}
