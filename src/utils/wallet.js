/**
 * This util is for everything related to the wallet of the current user.
 */
import { ethers } from "ethers";

export const getWalletWMOVRBalance = async (wmovrContract, address) => {
  const wmovrBalance = await wmovrContract.balanceOf(address);

  return ethers.utils.formatEther(wmovrBalance);
};

export const getWalletZoomBalance = async (zoomContract, address) => {
  const zoomBalance = await zoomContract.balanceOf(address);

  return ethers.utils.formatEther(zoomBalance);
};
