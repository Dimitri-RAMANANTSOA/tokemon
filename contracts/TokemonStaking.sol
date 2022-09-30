// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import './TokemonERC721A.sol';
import './TokemonIsERC20.sol';

contract TokemonStaking {

    uint public totalStaked;

    struct Staking {
        uint24 tokenId;
        uint48 stakingStartTime;
        address owner;
    }

    mapping (uint => Staking) NFTStaked;

    uint rewardsPerHour = 10000;

    TokemonIsERC20 token;
    TokemonERC721A nft;

    event Staked(address indexed owner, uint tokenId, uint timestamp);
    event Unstaked(address indexed owner, uint tokenId, uint timestamp);
    event Claimed(address indexed owner, uint amount);

    constructor(TokemonIsERC20 _token, TokemonERC721A _nft) {
        token = _token;
        nft = _nft;
    }

    function Stake(uint[] calldata tokenIds) external {
        uint tokenId;
        totalStaked += tokenIds.length;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
            require(NFTStaked[tokenId].stakingStartTime == 0, "Already Staked");

            nft.transferFrom(msg.sender, address(this), tokenId);
            emit Staked(msg.sender, tokenId, block.timestamp);

            NFTStaked[tokenId] = Staking({
                tokenId: uint24(tokenId),
                stakingStartTime: uint48(block.timestamp),
                owner: msg.sender
            });
        }
    }

    function claim(uint[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, false);
    }

    function unstake(uint[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, true);
    }

    function _unstakedMany(address owner, uint[] calldata tokenIds) internal {
        uint tokenId;
        totalStaked -= tokenIds.length;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(NFTStaked[tokenId].owner == msg.sender, "Not the owner");

            emit Unstaked(owner, tokenId, block.timestamp);

            delete NFTStaked[tokenId];

            nft.transferFrom(address(this), owner, tokenId);
        }
    }

    function _claim(address owner, uint[] calldata tokenIds, bool _unstake) internal {
        uint tokenId;
        uint earned;
        uint totalEarned;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            Staking memory thisStake = NFTStaked[tokenId];
            require(thisStake.owner == owner, "Impossible to claim, you're not the owner");

            uint stakingStartTime = thisStake.stakingStartTime;

            earned = ((block.timestamp - stakingStartTime) * rewardsPerHour) / 3600;
            totalEarned +=earned;

            NFTStaked[tokenId] = Staking({
                tokenId: uint24(tokenId),
                stakingStartTime: uint48(block.timestamp),
                owner: owner
            });
        }

        if(totalEarned > 0) {
            token.mint(owner, totalEarned);
        }
        if (_unstake) {
            _unstakedMany(owner, tokenIds);
        }

        emit Claimed(owner, totalEarned);
    }

    function getRewarsAmmount(address owner, uint[] calldata tokenIds) external view returns(uint) {
        uint tokenId;
        uint earned;
        uint totalEarned;

        for(uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            Staking memory thisStake = NFTStaked[tokenId];
            require(thisStake.owner == owner, "Impossible to see rewards, you're not the owner");

            uint stakingStartTime = thisStake.stakingStartTime;

            earned = ((block.timestamp - stakingStartTime) * rewardsPerHour) / 3600;
            totalEarned +=earned;
        }

        return totalEarned;
    }

    function tokenStakedByOwner(address owner) external view returns(uint[] memory) {
        uint totalSupply = nft.totalSupply();
        uint[] memory tmp = new uint[](totalSupply);
        uint index = 0;

        for(uint i = 0; i < totalSupply; i++) {
            if(NFTStaked[i].owner == owner) {
                tmp[index] = i;
                index++;
            }
        }

        uint[] memory tokens = new uint[](index);

        for(uint i = 0; i < index; i++) {
            tokens[i] = tmp[i];
        }

        return tokens;
    }
}