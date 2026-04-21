const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');
const web3_1 = require("web3_1.2");

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);

const getTrustedRemotes = async ()=> {
    let chainID = config.solChainID;
    let scAddr = config.SolScAddr;
    let decodeScAppAddr = web3_1.utils.asciiToHex(scAddr);
    console.log('decodeScAppAddr: ', decodeScAppAddr);
    let ret = await tokenRomte.getTrustedRemote(chainID, decodeScAppAddr);
    console.log(ret);
}



const main = async ()=> {

    await getTrustedRemotes();

}
main();