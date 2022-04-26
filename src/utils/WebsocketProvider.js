import { ethers } from 'ethers'
class WebsocketProvider {
  constructor(rpcUrl, reconnectionCallback) {
    this.provider = undefined

    this.KEEP_ALIVE_CHECK_INTERVAL = 1000

    this.keepAliveInterval = undefined

    this.rpcUrl = rpcUrl
    this.reconnectionCallback = reconnectionCallback || undefined
  }

  init() {
    this.provider = new ethers.providers.WebSocketProvider(this.rpcUrl)

    this.signer = this.provider.getSigner()

    this.defWsOpen = this.provider._websocket.onopen
    this.defWsClose = this.provider._websocket.onclose

    this.provider._websocket.onopen = (event) => this.onWsOpen(event)
    this.provider._websocket.onclose = (event) => this.onWsClose(event)
  }

  /**
   * Check class is loaded.
   * @returns Bool
   */
  isLoaded() {
    if (!this.provider) return false
    return true
  }

  onWsOpen(event) {
    console.log('Connected to the WS!')
    this.keepAliveInterval = setInterval(() => {
      if (
        this.provider._websocket.readyState === WebSocket.OPEN ||
        this.provider._websocket.readyState === WebSocket.OPENING
      )
        return

      this.provider._websocket.close()
    }, this.KEEP_ALIVE_CHECK_INTERVAL)

    if (this.defWsOpen) this.defWsOpen(event)
  }

  /**
   * Triggered on websocket termination.
   * Tries to reconnect again.
   */
  onWsClose(event) {
    console.log('WS connection lost! Reconnecting...')
    clearInterval(this.keepAliveInterval)
    this.init()

    if (this.reconnectionCallback) this.reconnectionCallback(this.provider)
    if (this.defWsClose) this.defWsClose(event)
  }
}

export default WebsocketProvider
