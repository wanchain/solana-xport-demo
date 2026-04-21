
const Web3 = require('web3_1.2');

const config = require('./config.js');

const Contract = require('./Contract');

const { ethers } = require('ethers');

let web3 = new Web3(new Web3.providers.HttpProvider(config.nodeUrl));

let txHash = "0x913cd5470e4bf2600e28afb32a2616e27d1a87c7ce7650e95914b03be0f609df";

let eventName = "MessageDispatchedNonEvm";


let getTx = async ()=> {
    let tx = await web3.eth.getTransaction(txHash);
    console.log(tx);

    let txReceipt = await web3.eth.getTransactionReceipt(txHash);
    console.log(txReceipt);

    let logs = txReceipt.logs;
    for(let i = 0; i < logs.length; i++){
        let log = logs[i];
        console.log(log);
    }


}

let block = 42360160;

let getLogs = async ()=> {
    let events = await web3.eth.getPastLogs({
        fromBlock:block,
        toBlock:block,
        topics:[],
        address:config.gateWayScAddr
    });
    console.log(events);

    let abi = require('./abi/gateway.json');

    const contract = new Contract(abi, config.gateWayScAddr);
    for(let i =0; i < events.length; i++){
        let event = events[i];
        let parsedEvent = contract.parseEvent(event);


        console.log('parsedEvent', parsedEvent);
        let data = parsedEvent.args.data;


        let message_data = ethers.utils.defaultAbiCoder.decode(['string', 'address','bytes', 'uint256'],data);

        console.log(message_data);



    }

}

const main = async () => {
    await getLogs();
}

main();


