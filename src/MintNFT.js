import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokemonERC721A from './artifacts/contracts/TokemonERC721A.sol/TokemonERC721A.json'
import './MintNFT.css';
import img1 from './img/1.png';
import img2 from './img/3.png';
import img3 from './img/6.png';
import icon from './img/icon-pokeball.png'

const TokemonNFT = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";
const SepoliachainId = "0xaa36a7";

function MintNFT() {

  const [accounts, setAccounts] = useState([]);
  const [displayaccounts, setdisplayaccounts] = useState([]);
  const [error, setError] = useState('');
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(true);

  useEffect(() => {
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

    requestAccount();
    checkChain()
  }, [])

  async function checkChain() {
    await window.ethereum.request({ method: 'eth_chainId' })
    .then((response) => {
      if(response == SepoliachainId) {
        fetchData();
        setLoader(false);
      }
      else {
        setError("Wrong Network, please select Sepolia test network");
      }
    })
  }

  async function requestAccount() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      let str = "";
      str += accounts[0].substring(0, 6)
      str += "..."
      str += accounts[0].substring(accounts[0].length, accounts[0].length - 4)
      setAccounts(accounts);
      setdisplayaccounts(str);
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
      <div className='top'>
        <p className="connected"><img className='icon' src={icon}></img>{displayaccounts}</p>
        {error && <p>{error}</p>}
        </div>
      <div className="container">
      <h1>Mint a Tokemon NFT</h1>
        <div className="banner">
          <img className='img-mint' src={img1} alt="img" />
          <img className='img-mint' src={img2} alt="img" />
          <img className='img-mint' src={img3} alt="img" />
        </div>

        {!loader &&
        accounts.length > 0 ?
        <>
        <div className='mint-info'>
        <p className="count">{data.totalSupply} / 100</p>
        <p className="cost">Each Tokemon costs {data.cost / 10**18} ETH (without gas fees)</p>
        </div>
        </>
        :
        <p className="notconnected">You are not connected</p>
        }
      </div>
      <div className='mint-btn'>
      <button className="mint" onClick={mint}>Mint</button>
          { accounts[0] === data.owner && 
              <button className="withdraw" onClick={withdraw}>Withdraw</button>
          }
          </div>
    </div>
  );
}

export default MintNFT;
