const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);



const getBalance = async ()=> {

    let user = config.receiptUserAddr;
    let ret = await tokenRomte.getTokenBalance(user);
    console.log('ret: ', ethers.utils.formatUnits(ret,6));

}



const main = async ()=> {

    await getBalance();


}
main();