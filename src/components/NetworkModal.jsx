import React from 'react'
import { Modal } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { NETWORK_ICONS } from '../constants'

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
          <NavLink to="/moonbase-alpha" className="network-links">
            <img
              src={NETWORK_ICONS['moonbase-alpha']}
              alt=""
              className="network-icons"
            />
            <p>Moonbase Alpha</p>
          </NavLink>
          <NavLink to="/moonriver" className="network-links">
            <img
              src={NETWORK_ICONS.moonriver}
              alt=""
              className="network-icons"
            />
            <p>Moonriver</p>
          </NavLink>
          <NavLink to="/moonbeam" className="network-links">
            <img
              src={NETWORK_ICONS.moonbeam}
              alt=""
              className="network-icons"
            />
            <p>Moonbeam</p>
          </NavLink>
        </div>
      </div>
    </Modal>
  )
}

export default NetworkModal
