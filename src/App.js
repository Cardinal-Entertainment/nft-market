import { useEffect } from 'react'
import logo from './logo.svg';
import './App.css';
import { ethers } from "ethers";
const global_json = require('./contracts/Global.json')
const wrapped_movr_json = require('./contracts/WrappedMovr.json')
const zoombies_market_place_json = require('./contracts/ZoombiesMarketPlace.json')
const zoombies_nft_json = require('./contracts/ZoombiesNFT.json')
const zoom_token_json = require('./contracts/ZoomToken.json')

const setupEthers = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress()

  const zoombiesContractAddress = "0x3E7997B8D30AA6216102fb2e9206246e478d57d3"
  const ZoombiesContract = new ethers.Contract(
    zoombiesContractAddress,
    zoombies_nft_json.abi,
    signer
  )
  console.log({ZoombiesContract})
  ZoombiesContract.setApprovalForAll("0x0D81Cd8e1c613c7A86A83C7269cB26B4fC6440b7", true)
}
const App = () => {
  useEffect(() => {
    setupEthers()
  }, [])
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
