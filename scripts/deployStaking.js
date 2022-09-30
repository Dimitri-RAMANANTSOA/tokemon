// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const STAKING = await hre.ethers.getContractFactory("TokemonStaking");
  const staking = await STAKING.deploy(
  "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508",
  "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
  );

  await staking.deployed();

  console.log(
    `Tokemon Staking deployed to ${staking.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
