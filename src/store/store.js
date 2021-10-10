import React, { createContext, useReducer } from "react";
import { ActionTypes } from "./actions";

export const DAPP_STATES = {
  NOT_CONNECTED: "NOT_CONNECTED",
  CONNECTED: "CONNECTED",
  WALLET_CONNECTED: "WALLET_CONNECTED",
};

const initialState = {
  dAppState: DAPP_STATES.NOT_CONNECTED,
  wallet: null,
  contracts: {
    ZoomContract: null,
    ZoombiesContract: null,
    MarketContract: null,
    WMOVRContract: null,
    GlobalContract: null,
  },
};

const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    const { type, payload } = action;
    console.log({ type, payload });
    switch (type) {
      case ActionTypes.WALLET_CHANGED:
        return {
          ...state,
          wallet: payload,
        };
      case ActionTypes.DAPP_STATE_CHANGED:
        return {
          ...state,
          dAppState: payload,
        };
      case ActionTypes.CONTRACTS_LOADED:
        return {
          ...state,
          contracts: payload,
        };
      default:
        throw new Error(`Unhandled action type: ${type}`);
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
