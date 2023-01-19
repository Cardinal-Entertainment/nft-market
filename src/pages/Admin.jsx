import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ethers } from 'ethers'


const Container = styled.div`
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
    const [isChecked1, setIsChecked1] = useState(true);
    const [isChecked2, setIsChecked2] = useState(true);
    
    const handleCheckbox1 = () => {
        setIsChecked1(!isChecked1);
    };

    const handleCheckbox2 = () => {
        setIsChecked2(!isChecked2);
    };


    return (
        <Container>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
                    integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
                    crossorigin="anonymous"
                />
            </head>
            <h1>Admin contract functions</h1>
            <div>
                <h3>Whitelist ERC20 token:</h3>
                <form>
                    <div className="form-group">
                        <label>Token Address</label>
                        <input type="text" id="token-address" className="form-control w-25"></input>
                    </div>
                    <div className="form-check">
                        <input type="checkbox" id="is-whitelist" checked={isChecked1} onChange={handleCheckbox1} className="form-check-input"></input>
                        <label>Is Whitelisted</label>
                    </div>
                    <div className="form-group">
                        <label>Min Increment</label>
                        <input type="number" id="min-increment" className="form-control w-25"></input>
                    </div>
                    <button type="submit" className="btn btn-primary text-white">Go</button>
                </form>
            </div>
            <div>
                <h3>Whitelist NFT Collection:</h3>
                <form>
                    <div className="form-group">
                        <label>Token Address</label>
                        <input type="text" id="token-address" className="form-control w-25"></input>
                    </div>
                    <div className="form-check">
                        <input type="checkbox" id="is-whitelist" checked={isChecked2} onChange={handleCheckbox2} className="form-check-input"></input>
                        <label>Is Whitelisted</label>
                    </div>
                    <button type="submit" className="btn btn-primary text-white">Go</button>
                </form>
                <h3>Update Max. NFT Count:</h3>
                <form>
                    <div className="form-group">
                        <label>Max NFT Count</label>
                        <input type="number" id="max-nft" className='form-control w-25'></input>
                    </div>
                    <button type="submit" className="btn btn-primary text-white">Go</button>
                </form>
                <h3>Update ZOOM burn fee:</h3>
                <form>
                    <div className="form-group">
                        <label>ZOOM burn fee</label>
                        <input type="number" id="burn-fee" className='form-control w-25'></input>
                    </div>
                    <button type="submit" className="btn btn-primary text-white">Go</button>
                </form>
                <h3>Update Max. Auction time:</h3>
                <form>
                    <div className="form-group">
                        <input type="number" id="auction-time" className='form-control w-25'></input>
                        <label>Max Auction time</label>
                    </div>
                    <button type="submit" className="btn btn-primary text-white">Go</button>
                </form>
            </div>
        </Container>
    )
}

export default Admin