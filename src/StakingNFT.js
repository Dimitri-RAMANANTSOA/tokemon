import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokemonERC721A from './artifacts/contracts/TokemonERC721A.sol/TokemonERC721A.json'
import TokemonStaking from './artifacts/contracts/TokemonStaking.sol/TokemonStaking.json'
import './App.css';

const TokemonNFT = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";
const TokemonToken = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";
const TokemonStake = "0x59F2f1fCfE2474fD5F0b9BA1E73ca90b143Eb8d0";
const baseIMG = "https://ipfs.io/ipfs/bafybeick36ixdiuh7sk62zii6kmefifqiestadng2gruxo2tnoefdkvmb4/"

function StakingNFT() {

  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [reward, setReward] = useState({});
  const [loader, setLoader] = useState(true);
  const [StakedNFT, setStakedNFT] = useState([]);
  const [NFTuri, setNFTuri] = useState([]);

  useEffect(() => {
    requestAccount();
    getNFTbalance();
    getStakingNFTbalance();
    showRewards();
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

  async function getNFTbalance() {
    
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, provider);
      setError('');
      let tab = [];
      try {
        const NFTlist = await contract.tokensOfOwner(accounts[0]);
        NFTlist.map((elem) => {
          tab.push(elem);
        })
        setNFTuri(tab);
      }
      catch(err) {
        setError(err.message);
      }
      
    }
  }

  async function getStakingNFTbalance() {
    
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(TokemonStake, TokemonStaking.abi, provider);
      setError('');
      let tab = [];
      try {
        const NFTlist = await contract.tokenStakedByOwner(accounts[0]);
        NFTlist.map((elem) => {
          tab.push(elem);
        })
        setStakedNFT(tab);
      }
      catch(err) {
        setError(err.message);
      }
      
    }
  }

  async function showRewards() {

    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(TokemonStake, TokemonStaking.abi, provider);
      setError('');

      try {
        await contract.tokenStakedByOwner(accounts[0])
        .then((response) => {
          contract.getRewarsAmmount(accounts[0],response)
          .then((rep) => {
            setReward(rep);
          })
        });
      }
      catch(err) {
        setError(err.message);
      }
      
    }

  }

  return (
    <div className="App">
      <>
      <div className='header'>
        <h1>Hello Tokemon</h1>
        {error && <p>{error}</p>}
        {!loader &&
        accounts.length > 0 ?
        <p className="connected">{accounts[0].slice(1, 10)}</p>
        :
        <p className="notconnected">You are not connected</p>
        }
        </div>

        <div className='info-container'>
          <div className='info-card1'>
            <p>rewards = {String(reward)}</p>
          </div>

          <div className='info-card2'>
            <p>rewards = {String(reward)}</p>
          </div>
        </div>

        <div className='card-container'>
        <div className='user-NFT'>
        {
          NFTuri.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" />
          })
        }
        </div>
        <div className='contract-NFT'>
        {
          StakedNFT.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" />
          })
        }
        </div>
        </div>
      </>
      </div>
  );
}

export default StakingNFT;
