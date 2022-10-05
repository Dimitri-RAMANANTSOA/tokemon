import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokemonERC721A from './artifacts/contracts/TokemonERC721A.sol/TokemonERC721A.json'
import TokemonStaking from './artifacts/contracts/TokemonStaking.sol/TokemonStaking.json'
import TokemonERC20 from './artifacts/contracts/TokemonIsERC20.sol/TokemonIsERC20.json'
import icon from './img/icon-pokeball.png'
import './StakingNFT.css';

const TokemonNFT = "0x1dBDba33dfA381bCC89FCe74DFF69Aa96B53b503";
const TokemonToken = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";
const TokemonStake = "0x7798A400cBe0Ca14a7D614ECa1CD15adE5055413";
const baseIMG = "https://ipfs.io/ipfs/bafybeick36ixdiuh7sk62zii6kmefifqiestadng2gruxo2tnoefdkvmb4/"
const SepoliachainId = "0xaa36a7";

function StakingNFT() {

  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [reward, setReward] = useState(0);
  const [loader, setLoader] = useState(true);
  const [StakedNFT, setStakedNFT] = useState([]);
  const [NFTuri, setNFTuri] = useState([]);
  const [balance, setBalance] = useState(0);
  const [NFTselected, setNFTselected] = useState([]);
  const [ContractNFTselected, setContractNFTselected] = useState([]);
  const [Selected, setSelected] = useState([]);
  const [ContractSelected, setContractSelected] = useState([]);
  const [UserStakeAll, setUserStakeAll] = useState(true);
  const [UserStake, setUserStake] = useState(true);
  const [ContractStakeAll, setContractStakeAll] = useState(true);
  const [ContractStake, setContractStake] = useState(true);

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
      if(response === SepoliachainId) {
        getData()
        setLoader(false);

        const interval=setInterval(()=>{
          showRewards()
        },25000)
          
        return()=>clearInterval(interval)
      }
      else {
        setError("Wrong Network, please select Sepolia test network");
        setReward(0);
        setBalance(0);
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
      setAccounts(str);
    }
  }

  function getData() {
    setNFTselected([]);
    setContractNFTselected([]);
    setSelected([]);
    setContractSelected([]);
    let imgbalise = document.getElementsByTagName('img');
    
    for(let i = 0;i < imgbalise.length; i++)
    {
      imgbalise[i].classList.remove('selected');
    }
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
        if (NFTlist.length > 0) {
          setUserStakeAll(false);
        }
        else {
          setUserStakeAll(true);
        }
        NFTlist.forEach((elem) => {
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
        if (NFTlist.length > 0) {
          setContractStakeAll(false);
        }
        else {
          setContractStakeAll(true);
        }
        NFTlist.forEach((elem) => {
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
          if (response.length > 0) {
            contract.getRewarsAmmount(accounts[0],response)
            .then((rep) => {
              setReward(rep);
            })
          }
          else {
            setReward(0);
          }
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
      const contractNFTSigner = new ethers.Contract(TokemonNFT, TokemonERC721A.abi, signer);

      let list = NFTIds;
      let approved = false;
      let transaction;

      await contractNFT.isApprovedForAll(accounts[0],TokemonStake)
      .then((response) => {
        if (response) {
          approved = true;
        }
      });

      if(!approved) {
        try {
          transaction = await contractNFTSigner.setApprovalForAll(TokemonStake, true);
          await transaction.wait();
        }
        catch(err) {
          setError(err.message);
        }
      }
            
      if (All) {
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
        let finallist = [];

        list.forEach((value, index) => {
          if (list[index] !== 'null') {
            finallist.push(value);
          }
        })

        list = finallist;
      }

      setError('');
      try {
        if(Stake) {
          transaction = await contractStaking.Stake(list)
        } 
        else {
          transaction = await contractStaking.unstake(list)
        } 
        
        await transaction.wait();
        getData();
        
      }
      catch(err) {
        setError(err.message);
      }
    }
  }

  function Load(e) {
    let tab = Selected
    let tab2 = ContractSelected
    tab[e.target.getAttribute("id")] = false;
    tab2[e.target.getAttribute("id")] = false;
    setSelected(tab);
    setContractSelected(tab2);
  }

  function Click(e, type) {
    if (type === "user") {
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

      let tmp = true;
      tab.forEach(elem => {
        if (elem === true) {
          tmp = false;
        }
      });

      setUserStake(tmp);
      setNFTselected(list);
      setSelected(tab);
      return
    }

    if (type === "contract") {
      let tab = ContractSelected
      let list = ContractNFTselected
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
      
      let tmp = true;
      tab.forEach(elem => {
        if (elem === true) {
          tmp = false;
        }
      });

      setContractStake(tmp);
      setContractNFTselected(list);
      setContractSelected(tab);
      return
    }
  }

  return (
    <div className="bg">
      <>
      <div className='top'>
        {!loader &&
        accounts.length > 0 ?
        <p className="connected"><img className='icon' alt="pokeball-icon" src={icon}></img>{accounts}</p>
        :
        <p className="notconnected">You are not connected</p>
        }
        </div> 
        <div className="container-error">
        {error && <p className='error'>{error}</p>}
        </div>       
        
        <div className='info-container'>
          <div className='info-card1'>
            <p className='inside-info'>Balance = {String(balance)}</p>
          </div>

          <div className='info-card2'>
            <p className='inside-info'>Rewards = {String(reward)}</p>
          </div>
        </div>

        <div className='card-container'>
        <div className='user-NFT'>
        {
          NFTuri.map((img) => {
           return <img className="img-nft" src={baseIMG + img + ".png"} id={img} key={img} alt="nft" onLoad={(e) => {Load(e)}} onClick={(e) => {Click(e,"user")}} />
          })
        }
        </div>
        <div className='contract-NFT'>
        {
          StakedNFT.map((img) => {
            return <img className="img-nft" src={baseIMG + img + ".png"} id={img} key={img} alt="nft" onLoad={(e) => {Load(e)}} onClick={(e) => {Click(e,"contract")}} />
          })
        }
        </div>
        </div>

        <div className='button-container'>
          <div className='range-one'>
          <button className="stake" disabled={UserStakeAll} onClick={() => StakeNFT(NFTselected,true,true)}>Stake All</button>
          <button className="stake" disabled={UserStake} onClick={() => StakeNFT(NFTselected,true,false)}>Stake Selection</button>
          </div>

          <div className='range-two'>
            <button className="unstake" disabled={ContractStakeAll} onClick={() => StakeNFT(ContractNFTselected,false,true)}>Unstake All</button>
            <button className="stake" disabled={ContractStake} onClick={() => StakeNFT(ContractNFTselected,false,false)}>Unstake Selection</button>
            <button className="claim" onClick={Claim}>Claim</button>
          </div>
        </div>
      </>
      </div>
  );
}

export default StakingNFT;
