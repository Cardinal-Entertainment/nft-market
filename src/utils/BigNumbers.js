import { ethers } from 'ethers';

export const bigNumberToString = (input) => {
  return ethers.BigNumber.from(input).toString();
};
