
const anchor = require('@coral-xyz/anchor');
const {PublicKey} = require("@solana/web3.js");
const {ethers} = require('ethers');
const abi = require('./idl/abi.SolMessageGateWay.json');
const config = require('./config');

const Solchain = require('./SolChain');

const {  FunctionCallData,
    OutboundFunctionCallData} = require('./utils');

const client = new Solchain(config.nodeUrl);

let txHash = 'KRjsESP8g1HTB7UPfev4oVZzZtWSVYiUys1tfANFCapX1gDd8C9JQR1Jnp88FLyS9DLTswmk9AvhnfQtzut4Qbn';

txHash = "5KTZohC1rSRBMEiYiwx5kANuEM7EZBNAvx95pYVRyMLS5APYaJjodHsdGyaiqFp1J8t9BKKRQaYxzbtLsae1DV4r";

let solt = 427062091;
let gateWayAddr = config.scAddr.gateway;

let coder = new anchor.BorshCoder(abi);

const eventParser = new anchor.EventParser(new PublicKey(gateWayAddr), coder);

(async ()=> {
    let tx = await client.getTransaction(txHash);
    const events = eventParser.parseLogs(tx.meta.logMessages, false);
    for(let event of events) {
        if(event.name === "CrosschainFunctionCall") {
            console.log('event: ', event);

            console.log('event.name:', event.name);
            console.log('event.data.task_id: ', event.data.task_id.toString('hex'));
            console.log('event.data.peer_chain_id: ',event.data.peer_chain_id.toNumber());
            console.log('event.data.peer_chain_app_address:', event.data.peer_chain_app_address.toString('hex'));
            // console.log('event.data.finally_function_call_data', event.data.finally_function_call_data.toString('hex'))
            console.log('event.data.gas_limit: ', event.data.gas_limit.toNumber());

            let data = event.data.finally_function_call_data;

            let OutboundFunctionCallDataParse = new OutboundFunctionCallData();

            let outBoundFunctionData = OutboundFunctionCallDataParse.fromBorshBytes(data);

            //console.log('outBoundFunctionData: ', outBoundFunctionData);

            console.log('networkdId', Number(outBoundFunctionData.networkId));
            console.log('contractAddress: ', outBoundFunctionData.contractAddress);

            let contractScPK = new PublicKey(Buffer.from(outBoundFunctionData.contractAddress,'hex'));

            console.log('contractAddress.toString: ',contractScPK.toBase58());
            const funcDataParser = new FunctionCallData();

            let functionCallData = funcDataParser.fromBorshBytes(outBoundFunctionData.functionCallData);

            //console.log('functionCallData: ', functionCallData);
            let messageFunc = functionCallData.messageFunc;
            console.log(Buffer.from(messageFunc,'hex').toString());
            let messageData = functionCallData.messageData;

            console.log('messageData: ', Buffer.from(messageData,'hex').toString('hex'));

            let message = ethers.utils.defaultAbiCoder.decode(['string','bytes','address', 'uint256'], messageData);
            console.log('message: ',message);

            let from = message[1].slice(2);

            console.log('from: ', from);
            let fromPublicKey = new PublicKey(Buffer.from(from,'hex'));
            console.log('fromBublicKey: ', fromPublicKey.toBase58());

            let to = message[2];





            break;
        }

    }


})();
