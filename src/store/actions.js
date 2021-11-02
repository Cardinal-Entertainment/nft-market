export const ActionTypes = {
  WALLET_CHANGED: "WALLET_CHANGED",
  DAPP_STATE_CHANGED: "DAPP_STATE_CHANGED",
  CONTRACTS_LOADED: "CONTRACTS_LOADED",
  NEW_BID_EVENT: "NEW_BID_EVENT",
  RESET_NOTIFICATIONS: "RESET_NOTIFICATIONS",
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
  newBidEventTriggered(payload) {
    return {
      type: ActionTypes.NEW_BID_EVENT,
      payload,
    };
  },
  resetNotifications( payload ) {
    return {
      type: ActionTypes.RESET_NOTIFICATIONS,
      payload,
    };
  }
};

export default Actions;
