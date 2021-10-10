export const ActionTypes = {
  WALLET_CHANGED: "WALLET_CHANGED",
  DAPP_STATE_CHANGED: "DAPP_STATE_CHANGED",
  CONTRACTS_LOADED: "CONTRACTS_LOADED",
};

const Actions = {
  walletChanged(payload) {
    return {
      type: ActionTypes.WALLET_CHANGED,
      payload,
    };
  },
  dAppStateChanged(payload) {
    return {
      type: ActionTypes.DAPP_STATE_CHANGED,
      payload,
    };
  },
  contractsLoaded(payload) {
    return {
      type: ActionTypes.CONTRACTS_LOADED,
      payload,
    };
  },
};

export default Actions;
