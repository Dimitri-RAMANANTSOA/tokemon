import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokemonERC721A from './artifacts/contracts/TokemonERC721A.sol/TokemonERC721A.json'
import TokemonStaking from './artifacts/contracts/TokemonStaking.sol/TokemonStaking.json'
import TokemonERC20 from './artifacts/contracts/TokemonIsERC20.sol/TokemonIsERC20.json'
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
  const [balance, setBalance] = useState([]);

  useEffect(() => {
    requestAccount();
    getData()
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
  function getData() {
    getNFTbalance();
    getStakingNFTbalance();
    showRewards();
    getBalance();
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

  async function getBalance() {

    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(TokemonToken, TokemonERC20.abi, provider);
      setError('');

      try {
        setBalance(await contract.balanceOf(accounts[0]))
      }
      catch(err) {
        setError(err.message);
      }
      
    }
  }

  async function Claim() {

    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractStaking = new ethers.Contract(TokemonStake, TokemonStaking.abi, signer);
      const callStaking = new ethers.Contract(TokemonStake, TokemonStaking.abi, provider);


      setError('');

      try {
        await callStaking.tokenStakedByOwner(accounts[0])
        .then((response) => {
          contractStaking.claim(response)
          .then((rep) => {
            rep.wait()
            .then(() => {
              getData(); 
            });  
          });    
        });
        
        
      }
      catch(err) {
        setError(err.message);
      }
      
    }
  }

  /**
   * 
   * @param {*} NFTIds List of NFT to stake
   * @param {*} Stake boolean to indicate if we need Stake (true) or Unstake (false)
   * @param {*} All boolean to indicate if we want stake/unstake all NFTs(true) or just the user selection
   */
  async function StakeNFT(NFTIds, Stake, All) {

    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractStaking = new ethers.Contract(TokemonStake, TokemonStaking.abi, signer);
      const contractNFT = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, provider);

      if (All) {
        setError('');
        try {
          if(Stake) {
            await contractNFT.tokensOfOwner(accounts[0])
            .then((response) => {
              NFTIds = response;
            });
          }
          else {
            await contractStaking.tokenStakedByOwner(accounts[0])
            .then((response) => {
              NFTIds = response;
            });
          }
          
        }
        catch(err) {
          setError(err.message);
        }

      }

      setError('');
      try {
        let transaction;
        if(Stake) {
          console.log('Stake', String(NFTIds));
          transaction = await contractStaking.Stake(NFTIds)
        } 
        else {
          console.log('Unstake', String(NFTIds));
          transaction = await contractStaking.unstake(NFTIds)
        } 
        
        await transaction.wait();
        getData();
        
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="App">
        <div>
          <p>rewards = {String(reward)}</p>
          <p>wallet = {String(balance)}</p>
          {error && <p>{error}</p>}
          {!loader &&
          accounts.length > 0 ?
          <>
          {/* <p className="connected">You are connected with account : {accounts[0]}</p>*/}
          <button className="stake" onClick={() => StakeNFT([2],true,true)}>Stake All</button>
          <button className="unstake" onClick={() => StakeNFT([2],false,true)}>Unstake All</button>

          <button className="stake" onClick={() => StakeNFT([0],true,false)}>Stake Croco</button>
          <button className="unstake" onClick={() => StakeNFT([0],false,false)}>Unstake Croco</button>
          <button className="claim" onClick={Claim}>Claim</button>
          </>
          :
          <p className="notconnected">You are not connected</p>
          }
        </div>
        <div className='User-NFT'>
        <p>NFT du User</p>
        {
          NFTuri.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" />
          })
        }
        </div>
        <div className='Contract-NFT'>
        <p>NFT du contrat</p>
        {
          StakedNFT.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" />
          })
        }
        </div>
    </div>
  );
}

export default StakingNFT;
