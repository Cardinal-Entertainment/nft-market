/**
 * This util is for everything related to the wallet of the current user.
 */
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export const getWalletWMOVRBalance = async (wmovrContract, address) => {
  const wmovrBalance = await wmovrContract.balanceOf(address);

  return ethers.utils.formatEther(wmovrBalance);
};

export const getWalletZoomBalance = async (zoomContract, address) => {
  const zoomBalance = await zoomContract.balanceOf(address);
  return ethers.utils.formatEther(zoomBalance);
};

export const unWrapMOVR = async (wmovrContract, amount) => {
  await wmovrContract.withdraw(ethers.utils.parseEther(amount));
};

export const wrapMOVR = async (wmovrContract, amount) => {
  await wmovrContract.deposit({ value: ethers.utils.parseEther(amount) });
};

export const addAssetToMetamask = async (tokenSymbol, address) => {
  const tokenDecimals = 18;

  let tokenImage = '';
  if (tokenSymbol === 'WMOVR') {
    tokenImage = 'https://zoombies.world/images/mr-icon.png';
  } else if (tokenSymbol === 'ZOOM') {
    tokenImage = 'https://zoombies.world/images/zoombies_coin.svg';
  }

  try {
    const metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });

    if (metamaskProvider) {
      await metamaskProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: address, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });
    }
  } catch (error) {
    console.error('addCZXPtoMetaMask error:', error);
  }
};

export const formatAddress = (address) => {
  return address ? `${address.substr(0, 10)}...${address.substr(34)}` : '';
};

export const isMetamaskInstalled = () => {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}
