import { NETWORKS } from '../constants'

export const getNetworkNameFromURL = () => {
  const pathname = window.location.pathname

  for (const key of Object.keys(NETWORKS)) {
    if (pathname.includes(key)) {
      return key
    }
  }

  return null
}
