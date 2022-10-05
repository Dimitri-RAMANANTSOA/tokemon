import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokemonERC721A from './artifacts/contracts/TokemonERC721A.sol/TokemonERC721A.json'
import './MintNFT.css';
import img1 from './img/1.png';
import img2 from './img/3.png';
import img3 from './img/6.png';

const TokemonNFT = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";

function MintNFT() {

  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    requestAccount();
    fetchData();
    setLoader(false);
  }, [])

  window.ethereum.addListener('connect', async(response) => {
    requestAccount();
  })

  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  })

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  })

  window.ethereum.on('disconnect', () => {
    window.location.reload();
  })

  async function requestAccount() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      setAccounts(accounts);
    }
  }

  async function fetchData() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, provider);

      try {
        const cost = await contract.cost();
        const totalSupply = await contract.totalSupply();
        const owner = await contract.owner();
        const object = {"cost": String(cost), "totalSupply": String(totalSupply), "owner": owner.toLowerCase()};
        setData(object);
      }
      catch(err) {
        setError(err.message);
      }

    }
  }

  async function mint() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, signer);
      console.log(signer);
      setError('');
      try {
        const transaction  = await contract.mint(1);
        await transaction.wait();
        fetchData();
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  async function withdraw() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, signer);

      setError('');
      try {
        const transaction  = await contract.withdraw();
        await transaction.wait();
        fetchData();
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="bg">
      <p className="connected">You are connected with account : {accounts[0]}</p>
      <div className="container">
        <div className="banner">
          <img className='img-nft' src={img1} alt="img" />
          <img className='img-nft' src={img2} alt="img" />
          <img className='img-nft' src={img3} alt="img" />
        </div>
        {error && <p>{error}</p>}
        <h1>Mint a Tokemon NFT</h1>
        <p className="count">{data.totalSupply} / 100</p>
        <p className="cost">Each Tokemon costs {data.cost / 10**18} ETH (without gas fees)</p>

        {!loader &&
        accounts.length > 0 ?
        <>
        <button className="mint" onClick={mint}>Buy a Tokemon</button>
        </>
        :
        <p className="notconnected">You are not connected</p>
        }
          { accounts[0] === data.owner && 
            <button className="withdraw" onClick={withdraw}>Withdraw</button>
          }
      </div>
    </div>
  );
}

export default MintNFT;
