import React, { useState, useContext, useEffect } from 'react'
import styled from 'styled-components/macro'
import { store } from 'store/store'
import { BigNumber } from 'ethers'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

const Container = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width: 100%;
color: white;
overflow-y: auto;
padding: 12px;
h2 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  a {
      color: cyan;
    }
`

const Admin = () => {
    const {
        state: { contracts, wallet },
      } = useContext(store)

    // const marketAddress = NETWORKS[network].marketContractAddress;
    const mContract = contracts.MarketContract;

    const [erc20State, setErc20State] = useState(
        {
            tokenAddress: '',
            minIncrement: 1,
            isWhitelisted: true
        }
    );

    const [nftState, setNftState] = useState(
        {
            tokenAddress: '',
            isWhitelisted: true
        }
    );

    const [maxNftState, setMaxNftState] = useState(1);

    const [zoomBurnState, setZoomBurnState] = useState(0);

    const [auctionTimeState, setAuctionTimeState] = useState(0);
    
    const erc20Handler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setErc20State({...erc20State, [name] : value});
    };

    const erc20CheckHandler = () => {
        const isWhite = (!erc20State.isWhitelisted);
        setErc20State({...erc20State, isWhitelisted : isWhite});
    };

    const nftHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setNftState({...nftState, [name] : value});
    };

    const nftCheckHandler = () => {
        const isWhite = (!nftState.isWhitelisted);
        setNftState({...nftState, isWhitelisted : isWhite});
    };

    const maxNftHandler = (e) => {
        setMaxNftState(e.target.value);
    };

    const zoomBurnHandler = (e) => {
        setZoomBurnState(e.target.value);
    };

    const auctionTimeHandler = (e) => {
        setAuctionTimeState(e.target.value);
    };

    const erc20SubmitHandler = (e) => {
        e.preventDefault();
        const result = {...erc20State};
        const new_inc = BigNumber.from(ethers.utils.parseUnits(result.minIncrement.toString())).toString();
        mContract.whitelistToken(result.tokenAddress, result.isWhitelisted, new_inc);
    }

    const nftSubmitHandler = (e) => {
        e.preventDefault();
        const result = {...nftState};
        mContract.whitelistNFTToken(result.tokenAddress, result.isWhitelisted);
    }

    const maxNftSubmitHandler = (e) => {
        e.preventDefault();
        const result = maxNftState;
        mContract.changeMaxNFTCount(result);
    }

    const zoomBurnSubmitHandler = (e) => {
        e.preventDefault();
        const result = BigNumber.from(ethers.utils.parseUnits(zoomBurnState.toString())).toString();
        mContract.changeZoomBurnFee(result);
    }

    const auctionTimeSubmitHandler = (e) => {
        e.preventDefault();
        const result = auctionTimeState;
        mContract.changeMaxAuctionTime(result);
    }

    (async () => {
        setMaxNftState( await parseInt(formatEther( await mContract.maxNFTCount())));
        setZoomBurnState( await parseInt(formatEther( await mContract.zoomBurnFee())));
        setAuctionTimeState( await parseInt(formatEther( await mContract.maxAuctionTime())));
    })()

    // console.log(mContract);

    return (
        <Container>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
                    integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
                    crossOrigin="anonymous"
                />
            </head>
            <div className="w-75">
                <h1>Admin contract functions</h1>

                <div className="bg-dark bg-gradient p-3 m-3">
                    <h3>Whitelist ERC20 token:</h3>
                    <form onSubmit={erc20SubmitHandler}>
                        <div className="form-group">
                            <label>Token Address</label>
                            <input type="text" id="tokenAddress" name="tokenAddress" value={erc20State.tokenAddress} onChange={erc20Handler} className="form-control w-50"></input>
                        </div>
                        <div className="form-group">
                            <label>Min Increment (In Eth)</label>
                            <input type="number" id="minIncrement" name="minIncrement" value={erc20State.minIncrement} onChange={erc20Handler} className="form-control w-50"></input>
                        </div>
                        <div className="form-check">
                            <input type="checkbox" id="isWhitelisted" name="isWhitelisted" checked={erc20State.isWhitelisted} onChange={erc20CheckHandler} className="form-check-input"></input>
                            <label>Is Whitelisted</label>
                        </div>
                        <button type="submit" className="btn btn-primary text-white w-25">Update</button>
                    </form>
                </div>

                <div className="bg-secondary bg-gradient p-3 m-3">
                    <h3>Whitelist NFT Collection:</h3>
                    <form onSubmit={nftSubmitHandler}>
                        <div className="form-group">
                            <label>Token Address</label>
                            <input type="text" id="tokenAddress" name="tokenAddress" value={nftState.tokenAddress} onChange={nftHandler} className="form-control w-50"></input>
                        </div>
                        <div className="form-check">
                            <input type="checkbox" id="isWhitelisted" name="isWhitelisted" checked={nftState.isWhitelisted} onChange={nftCheckHandler} className="form-check-input"></input>
                            <label>Is Whitelisted</label>
                        </div>
                        <button type="submit" className="btn btn-primary text-white w-25">Update</button>
                    </form>
                </div>

                <div className="bg-dark bg-gradient p-3 m-3">    
                    <h3>Update Max. NFT Count:</h3>
                    <form onSubmit={maxNftSubmitHandler}>
                        <div className="form-group">
                            <label>Max NFT Count</label>
                            <input type="number" id="maxNft" name="maxNft" max="20" min="1" value={maxNftState} onChange={maxNftHandler} className='form-control w-50'></input>
                        </div>
                        <button type="submit" className="btn btn-primary text-white w-25">Update</button>
                    </form>
                </div>

                <div className="bg-secondary bg-gradient p-3 m-3">    
                    <h3>Update ZOOM burn fee:</h3>
                    <form onSubmit={zoomBurnSubmitHandler}>
                        <div className="form-group">
                            <label>ZOOM burn fee (In Eth)</label>
                            <input type="number" id="zoomBurn" name="zoomBurn" max="10000000" min="0" value={zoomBurnState} onChange={zoomBurnHandler} className='form-control w-50'></input>
                        </div>
                        <button type="submit" className="btn btn-primary text-white w-25">Update</button>
                    </form>
                </div>

                <div className="bg-dark bg-gradient p-3 m-3">    
                    <h3>Update Max. Auction time:</h3>
                    <form onSubmit={auctionTimeSubmitHandler}>        
                        <div className="form-group">
                            <input type="number" id="auctionTime" name="auctionTime" min="0" value={auctionTimeState} onChange={auctionTimeHandler} className='form-control w-50'></input>
                            <label>Max Auction time</label>
                        </div>
                        <button type="submit" className="btn btn-primary text-white w-25">Update</button>
                    </form>
                </div>

            </div>
        </Container>
    )
}

export default Admin