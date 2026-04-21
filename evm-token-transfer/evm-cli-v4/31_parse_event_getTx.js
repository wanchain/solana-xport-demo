
const Web3 = require('web3_1.2');

const config = require('./config.js');

const Contract = require('./Contract');

const { ethers } = require('ethers');

let web3 = new Web3(new Web3.providers.HttpProvider(config.nodeUrl));

let txHash = "0xe651563b87cc492999995d4d2e909550bfc209a1e325c6ffabf5d43ff82569c1";




let getTx = async ()=> {
    let tx = await web3.eth.getTransaction(txHash);
    console.log("tx", tx);

    let txReceipt = await web3.eth.getTransactionReceipt(txHash);
    console.log("txReceipt: ", txReceipt);

    let logs = txReceipt.logs;
    for(let i = 0; i < logs.length; i++){
        let log = logs[i];
        console.log(i, ': ', log);
    }


}



const main = async () => {
    await getTx();
}

main();


