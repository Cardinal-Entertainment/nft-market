import React from 'react'
import { Modal } from '@mui/material'
import { NETWORK_ICONS } from '../constants'

const goto = (link) => {
  window.location.replace(link)
}

const NetworkModal = ({ isNetworkModalOpen, handleClose }) => {
  return (
    <Modal
      open={isNetworkModalOpen}
      onClose={handleClose}
      aria-labelledby="network-modal-title"
    >
      <div className="network-modal">
        <h1 id="network-modal-title">Select a network</h1>
        <div className="network-switch-btn-container">
          <button onClick={() => goto('/moonbase-alpha')} to="/moonbase-alpha" className="network-links">
            <img
              src={NETWORK_ICONS['moonbase-alpha']}
              alt=""
              className="network-icons"
            />
            <p>Moonbase Alpha</p>
          </button>
          <button onClick={() => goto('/moonriver')} variant='outlined' to="/moonriver" className="network-links">
            <img
              src={NETWORK_ICONS.moonriver}
              alt=""
              className="network-icons"
            />
            <p>Moonriver</p>
          </button>
          {/* <button onClick={() => goto('/moonbeam')} variant='outlined' to="/moonbeam" className="network-links">
            <img
              src={NETWORK_ICONS.moonbeam}
              alt=""
              className="network-icons"
            />
            <p>Moonbeam</p>
          </button> */}
        </div>
      </div>
    </Modal>
  )
}

export default NetworkModal
