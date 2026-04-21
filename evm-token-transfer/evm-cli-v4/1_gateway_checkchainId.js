const config = require('./config.js');
const GateWay = require('./GateWay');
const { ethers } = require("ethers");

let gateway = new GateWay(config.nodeUrl, config.gateWayScAddr);

const checkchainId = async ()=> {
    let chainId = config.solChainID;

    let ret = await gateway.checkSupportChainid(chainId);
    console.log(ret);

    let maxGaslist = await gateway.maxGasLimit();
    console.log(ethers.utils.formatEther(maxGaslist));
    let mixGasLimit = await gateway.minGasLimit();
    console.log(ethers.utils.formatEther((mixGasLimit)));
}

const main = async ()=> {
    await checkchainId();
}
main();