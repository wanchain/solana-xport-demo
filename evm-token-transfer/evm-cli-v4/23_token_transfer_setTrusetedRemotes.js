const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');
const web3_1 = require("web3_1.2");

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);


const setTrustedRemotes = async ()=> {
    let chainID = config.solChainID;
    let scAddr = config.SolScAddr;
    let words = config.words;

    let wallet = ethers.Wallet.fromMnemonic(words)
    let decodeScAppAddr = web3_1.utils.asciiToHex(scAddr);
    console.log('decodeScAppAddr: ', decodeScAppAddr);
    await tokenRomte.setTrustedRemote(wallet, chainID, decodeScAppAddr);
}



const main = async ()=> {

    await setTrustedRemotes();


}
main();