import React, { createContext, useReducer } from 'react'
import { ActionTypes } from './actions'
import logger from './logger'
import { toBigNumber } from '../utils/BigNumbers'

export const DAPP_STATES = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  CONNECTED: 'CONNECTED',
  WALLET_CONNECTED: 'WALLET_CONNECTED',
}

const initialState = {
  dAppState: DAPP_STATES.NOT_CONNECTED,
  wallet: {
    address: null,
    balance: null,
    chainId: null,
    zoomBalance: null,
    wmovrBalance: null,
    usdtBalance: null,
    daiBalance: null,
  },
  contracts: {
    ZoomContract: null,
    MarketContract: null,
    ReadOnlyMarketContract: null,
    WMOVRContract: null,
    USDTContract: null,
    DAIContract: null,
    nftContracts: {},
  },
  signer: null,
  events: [],
  newEventsCount: 0,
  myEvents: [],
  myNewEventsCount: 0,
  zoomIncrement: toBigNumber(25000), //this is ether units, convert to BigNumber and use wei
  wmovrIncrement: toBigNumber(0.02), //this is ether units, convert to BigNumber and use wei
  usdtIncrement: toBigNumber(1), //this is ether units, convert to BigNumber and use wei
  daiIncrement: toBigNumber(1), //this is ether units, convert to BigNumber and use wei
}

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    logger(action)
    const { type, payload } = action

    switch (type) {
      case ActionTypes.WALLET_CHANGED:
        return {
          ...state,
          wallet: {
            ...state.wallet,
            ...payload,
          },
        }
      case ActionTypes.DAPP_STATE_CHANGED:
        return {
          ...state,
          dAppState: payload,
        }
      case ActionTypes.CONTRACTS_LOADED:
        return {
          ...state,
          contracts: payload.contracts,
          signer: payload.signer,
        }
      case ActionTypes.NEW_BID_EVENT:
        return {
          ...state,
          newEventsCount: state.newEventsCount + 1,
          events: [payload, ...state.events],
        }
      case ActionTypes.MY_NEW_BID_EVENT:
        return {
          ...state,
          myNewEventsCount: state.myNewEventsCount + 1,
          myEvents: [payload, ...state.myEvents],
        }
      case ActionTypes.RESET_NOTIFICATIONS:
        return {
          ...state,
          newEventsCount: 0,
          events: payload ? [] : state.events,
        }
      case ActionTypes.MIN_INCREMENT_UPDATED:
        return {
          ...state,
          zoomIncrement: payload.zoomIncrement,
          wmovrIncrement: payload.wmovrIncrement,
          usdtIncrement: payload.usdtIncrement,
          daiIncrement: payload.daiIncrement,
        }
      case ActionTypes.CLEAR_WALLET:
        Object.keys(state.contracts).forEach((key) => {
          const contract = state.contracts[key]
          if (contract) {
            contract.provider.removeAllListeners()
          }
        })
        return initialState
      default:
        throw new Error(`Unhandled action type: ${type}`)
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }
