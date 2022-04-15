import { ethers } from 'ethers'

export const bigNumberToString = (input) => {
  return ethers.BigNumber.from(input).toString()
}

export const compareAsBigNumbers = (a, b) => {
  let res = -2 //err
  let bigA = ethers.BigNumber.from(0)
  let bigB = ethers.BigNumber.from(0)

  try {
    bigA = ethers.utils.parseEther(a.toString())
  } catch (e) {}
  try {
    bigB = ethers.utils.parseEther(b.toString())
  } catch (e) {}

  if (bigA.gt(bigB)) {
    res = 1
  } else if (bigA.lt(bigB)) {
    res = -1
  } else {
    // if (bigA.eq(bigB)) {
    res = 0
  }

  return res
}

export const toBigNumber = (a) => {
  return ethers.utils.parseEther(a.toString())
}
