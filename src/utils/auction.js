import {
  NETWORKS,
} from '../constants'

export const getTokenSymbol = (saleToken, networkName) => {
  const {
    zoomContractAddress,
    wmovrContractAddress,
    usdtContractAddress,
    daiContractAddress
  } = NETWORKS[networkName]
  switch (saleToken) {
    case zoomContractAddress:
      return 'ZOOM'
    case wmovrContractAddress:
      return 'MOVR'
    case usdtContractAddress:
      return 'USDT'
    case daiContractAddress:
      return 'DAI'
    default:
      return 'Unknown'
  }
}

export const isItemSettled = async (itemNumber, marketContract) => {
  if (!marketContract) {
    return null
  }
  try {
    const itemFromChain = await marketContract.getListItem(itemNumber)
    const isItemSettled =
      itemFromChain === undefined ||
      itemFromChain.seller === '0x0000000000000000000000000000000000000000'
        ? true
        : false

    return isItemSettled
  } catch (err) {
    console.error(err)
    return false
  }
}
