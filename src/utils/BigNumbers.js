import { ethers } from 'ethers';

export const bigNumberToString = (input) => {
  return ethers.BigNumber.from(input).toString();
};

export const compareBigNumbers = ( a, b ) => {

  const bigA = ethers.utils.parseEther(a.toString());
  const bigB = ethers.utils.parseEther(b.toString());

  if (bigA.gt(bigB)) {
    return 1;
  } else if (bigA.lt(bigB)) {
    return -1;
  } else {// if (bigA.eq(bigB)) {
    return 0;
  }
};