import React, { createContext, useReducer } from 'react'
import { ActionTypes } from './actions'
import logger from './logger'

export const DAPP_STATES = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  CONNECTED: 'CONNECTED',
  WALLET_CONNECTED: 'WALLET_CONNECTED',
}

const initialState = {
  dAppState: DAPP_STATES.NOT_CONNECTED,
  isInitialSetupDone: false,
  wallet: {
    address: null,
    balance: null,
    chainId: null,
    zoomBalance: null,
    usdtBalance: null,
    daiBalance: null,
    usdcBalance: null,
    beansBalance: null,
    xcKSMBalance: null,
  },
  contracts: {
    ZoomContract: null,
    MarketContract: null,
    ReadOnlyMarketContract: null,
    WMOVRContract: null,
    USDTContract: null,
    DAIContract: null,
    USDCContract: null,
    BEANSContract: null,
    xcKSMContract: null,
    nftContracts: {},
  },
  signer: null,
  events: [],
  newEventsCount: 0,
  myEvents: [],
  myNewEventsCount: 0,
  zoomIncrement: 25000,
  wmovrIncrement: 0.02,
  usdtIncrement: 1,
  daiIncrement: 1,
  xcKSMIncrement: 0.001,
  usdcIncrement: 1,
  beansIncrement: 1,
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
          beansIncrement: payload.beansIncrement,
          xcKSMIncrement: payload.xcKSMIncrement,
        }
      case ActionTypes.CLEAR_WALLET:
        Object.keys(state.contracts).forEach((key) => {
          const contract = state.contracts[key]
          if (contract) {
            contract.provider.removeAllListeners()
          }
        })
        return initialState
      case ActionTypes.FINISHED_SETUP:
        return {
          ...state,
          isInitialSetupDone: true,
        }
      default:
        throw new Error(`Unhandled action type: ${type}`)
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }
