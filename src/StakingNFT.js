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
  const [NFTselected, setNFTselected] = useState([]);
  const [ContractNFTselected, setContractNFTselected] = useState([]);
  const [Selected, setSelected] = useState([]);
  const [ContractSelected, setContractSelected] = useState([]);

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
    setNFTselected([]);
    setContractNFTselected([]);
    setSelected([]);
    setContractSelected([]);
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
  async function StakeNFT(NFTIds,Stake, All) {

    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractStaking = new ethers.Contract(TokemonStake, TokemonStaking.abi, signer);
      const contractNFT = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, provider);
      console.log("NFTIds : ", NFTselected)

      let list = NFTIds;
            
      if (All) {
        console.log("All NFTs");
        setError('');
        try {
          if(Stake) {
            await contractNFT.tokensOfOwner(accounts[0])
            .then((response) => {
              list = response;
            });
          }
          else {
            await contractStaking.tokenStakedByOwner(accounts[0])
            .then((response) => {
              list = response;
            });
          }
          
        }
        catch(err) {
          setError(err.message);
        }

      }
      else {
        console.log("selection")
        let finallist = [];

        list.forEach((value, index) => {
          console.log ("index = " + index);
          if (list[index] != 'null') {
            console.log ("delete i = " + index)
            finallist.push(value);
          }
        })

        list = finallist;
      }

      setError('');
      try {
        let transaction;
        if(Stake) {
          console.log('Stake', String(list));
          transaction = await contractStaking.Stake(list)
        } 
        else {
          console.log('Unstake', String(list));
          transaction = await contractStaking.unstake(list)
        } 
        
        await transaction.wait();
        getData();
        
      }
      catch(err) {
        setError(err.message);
      }

      console.log('valeur usestate', NFTselected)
    }
  }

  function Load(e) {
    let tab = Selected
    let tab2 = ContractSelected
    tab[e.target.getAttribute("id")] = false;
    tab2[e.target.getAttribute("id")] = false;
    console.log("Loading tab", tab)
    setSelected(tab);
    setContractSelected(tab2);
  }

  function Click(e, type) {
    if (type == "user") {
      let tab = Selected
      let list = NFTselected
      let i = e.target.getAttribute("id")

      tab[i] = !tab[i];

      if (tab[i]) {
        list[i] = i;
        e.target.setAttribute("class", "img-nft selected")
      }
      else {
        list[i] = 'null';
        e.target.setAttribute("class", "img-nft")
      }
      setNFTselected(list);
      setSelected(tab);
      console.log("user tab", tab)
      console.log("user list", list)
      return
    }

    if (type == "contract") {
      let tab = ContractSelected
      let list = ContractNFTselected
      let i = e.target.getAttribute("id")
      tab[i] = !tab[i];
      

      if (tab[i]) {
        list[i] = i;
      }
      else {
        list[i] = null;
      }
      setContractNFTselected(list);
      setContractSelected(tab);
      console.log("contract tab", tab)
      console.log("contract list", list)
      return
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
            <p className='inside-info'>Balance = {String(balance)}</p>
          </div>

          <div className='info-card2'>
            <p className='inside-info'>rewards = {String(reward)}</p>
          </div>
        </div>

        <div className='card-container'>
        <div className='user-NFT'>
        {
          NFTuri.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" onLoad={(e) => {Load(e)}} onClick={(e) => {Click(e,"user")}} />
          })
        }
        </div>
        <div className='contract-NFT'>
        {
          StakedNFT.map((img) => {
            return <img className="img-nft" src={baseIMG + img + ".png"} id={img} alt="nft" onLoad={(e) => {Load(e)}} onClick={(e) => {Click(e,"contract")}} />
          })
        }
        </div>
        </div>

        <div className='button-container'>
          <div className='range-one'>
          <button className="stake" onClick={() => StakeNFT(NFTselected,true,true)}>Stake All</button>
          <button className="stake" onClick={() => StakeNFT(NFTselected,true,false)}>Stake Selection</button>
          </div>

          <div className='range-two'>
            <button className="unstake" onClick={() => StakeNFT(ContractNFTselected,false,true)}>Unstake All</button>
            <button className="stake" onClick={() => StakeNFT(ContractNFTselected,false,false)}>Unstake Selection</button>
            <button className="claim" onClick={Claim}>Claim</button>
          </div>
        </div>
      </>
      </div>
  );
}

export default StakingNFT;
