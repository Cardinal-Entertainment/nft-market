export const ActionTypes = {
  WALLET_CHANGED: 'WALLET_CHANGED',
  DAPP_STATE_CHANGED: 'DAPP_STATE_CHANGED',
  CONTRACTS_LOADED: 'CONTRACTS_LOADED',
  NEW_BID_EVENT: 'NEW_BID_EVENT',
  MY_NEW_BID_EVENT: 'MY_NEW_BID_EVENT',
  RESET_NOTIFICATIONS: 'RESET_NOTIFICATIONS',
  MIN_INCREMENT_UPDATED: 'MIN_INCREMENT_UPDATED',
  CLEAR_WALLET: 'CLEAR_WALLET',
  FINISHED_SETUP: 'FINISHED_SETUP'
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
  myNewBidEventTriggered(payload) {
    return {
      type: ActionTypes.MY_NEW_BID_EVENT,
      payload,
    };
  },
  resetNotifications(payload) {
    return {
      type: ActionTypes.RESET_NOTIFICATIONS,
      payload,
    };
  },
  minIncrementUpdated(payload) {
    return {
      type: ActionTypes.MIN_INCREMENT_UPDATED,
      payload,
    };
  },
  clearWallet() {
    return {
      type: ActionTypes.CLEAR_WALLET
    }
  },
  setupDone() {
    return {
      type: ActionTypes.FINISHED_SETUP
    }
  }
};

export default Actions;
