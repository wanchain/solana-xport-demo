const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);


const send = async ()=> {
    let words = config.words;

    let wallet = ethers.Wallet.fromMnemonic(words);

    let receiptTo = config.solUserATA;
    //todo: receipTo must be ata;
    let ret = await tokenRomte.send(wallet, Buffer.from(receiptTo),9);

    //0xe651563b87cc492999995d4d2e909550bfc209a1e325c6ffabf5d43ff82569c1
}

const main = async ()=> {

    await send();

}
main();