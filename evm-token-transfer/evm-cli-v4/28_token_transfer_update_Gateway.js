const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);


const update_gateway = async ()=> {
    let words = config.words;

    let wallet = ethers.Wallet.fromMnemonic(words);

    let newScAppAddr = config.gateWayScAddr;

    let ret = await tokenRomte.updateWmbGateway(wallet, newScAppAddr);
}

const main = async ()=> {

    await update_gateway();

}
main();