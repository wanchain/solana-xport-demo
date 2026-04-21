const hre = require('hardhat');
const fs = require('fs');
const config = require('../evm-cli-v4/config');

let _wmbGateway = config.gateWayScAddr;//   //evm gate_way
let homeAddress = config.SolScAddr; //solana demo app programId
let _homeChainId = config.solChainID;// 2147484149;  //solana chainid
let _name = "wrap solana usdc";
let _symbol = "WSUSDC"


async function main () {
    let deployer = (await hre.ethers.getSigners())[0].address;

    console.log('Deploying on', hre.network.name, 'with account', deployer);
    const LogicContractName = "ERC20TokenRemote"
    const logic = await hre.ethers.getContractFactory(LogicContractName);
    const instance = await logic.deploy(
        _wmbGateway,
        Buffer.from(homeAddress),
        _homeChainId,
        _name,
        _symbol

    );


  await instance.waitForDeployment();
  console.log(LogicContractName, "Logic address:", instance.target);

    
}

main().catch((error)=> {
  console.error(error);
  process.exitCode = 1;
})