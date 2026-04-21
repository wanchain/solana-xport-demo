const { ethers,  } = require('ethers');
const config = require('./config.js');
const  {
    hexAdd0x, hexTrip0x
} = require('./libs.js');
const Erc20TokenRemote = require('./Erc20TokenRemote');

let tokenRomte = new Erc20TokenRemote(config.nodeUrl, config.tokenTransferScAddr);

const getGateWayAddress = async ()=> {
    let ret = await tokenRomte.getWmbGateWay();
    console.log(ret);
}



const main = async ()=> {
    await getGateWayAddress();


}
main();