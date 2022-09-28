// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Tokemon = await hre.ethers.getContractFactory("Tokemon");
  const tokemon = await Tokemon.deploy(
  "Tokemon",
  "TKM",
  "ipfs://bafybeigmth5rfq6l4s63nvf2mxrp57c43yuc4g5esihw66rwuu7dbjzvpa/",
  "ipfs://bafybeigmth5rfq6l4s63nvf2mxrp57c43yuc4g5esihw66rwuu7dbjzvpa/"
  );

  await tokemon.deployed();

  console.log(
    `Tokemon deployed to ${tokemon.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
