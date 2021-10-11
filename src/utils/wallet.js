/**
 * This util is for everything related to the wallet of the current user.
 */
import { ethers } from "ethers";
import { bigNumberToString } from "./BigNumbers";

export const getBalance = async (signer) => {
  const balance = await signer.getBalance();
  const balanceString = bigNumberToString(balance);

  return ethers.utils.formatEther(balanceString);
};

export const getZoomBalance = async (zoomContract, address) => {
  const zoomBalance = await zoomContract.balanceOf(address);

  return ethers.utils.formatEther(zoomBalance);
};
