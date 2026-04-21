const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);


const wmbReceiveNonEvm = async ()=> {
    let words = config.words;

    let wallet = ethers.Wallet.fromMnemonic(words);

    let data =  "000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000093a7f07e94eaf48593905735eac165fee0306375000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000b63726f73735f746f6b656e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020609dabfa30ebdfb97eb54ced68750782ea740bd248a88c69aea1b82a66321f24";
    let messageId = "5bf042280a1add9609e83e0f32252aa0bb24b0e88637eaa6b21ab72fcd387379";
    let fromChainId = 2147484149;
    let from = config.SolScAddr;

    let ret = await tokenRomte.wmbReceiveNonEvm(wallet, hexAdd0x(data) , hexAdd0x(messageId), fromChainId, Buffer.from(from));

    //0x40f1cf5fdb04b2db3331742f5120b9360cd670d0d64320bbc1562b613f0d2db3

}


const main = async ()=> {


    await wmbReceiveNonEvm();


}
main();