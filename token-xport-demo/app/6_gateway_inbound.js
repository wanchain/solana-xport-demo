
const config = require('./config');
const GateWayApp = require('./GateWayApp');
const {tokenAgent, tokenLocker, tokenOperater} = require('./test_wallets');
const {    InboundFunctionCallData,
    EncodeInfo,
    EncodeProof,
    FunctionCallData,
    OutboundFunctionCallData } = require('./utils');
const {keccak256} = require("ethereumjs-util");
const secp256k1 = require('secp256k1');
const { PublicKey } = require('@solana/web3.js');
let agent = tokenAgent();

let gateWayApp = new GateWayApp(agent);


let inboundCall = async ()=> {
    let messageData = "0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000093a7f07e94eaf48593905735eac165fee030637500000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000b756e6c6f636b546f6b656e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b72634d616b4870324d7742597159785844704c61334137514e743451374a6452374d6e657550757a663275000000000000000000000000000000000000000000";
    let taskId = '0x4ccb59e54932fc7967bcb59fd6ffcd91bc85cbd33d8f74f3807b3fb6289e5c73';
    let ttl = Math.floor(Date.now() / 1000) + 3600 ;
    let networkId = 2147484149;

    const rawEvmDataBytes = Buffer.from(messageData.slice(2), 'hex');
    console.log('Raw EVM data bytes length:', rawEvmDataBytes.length);

    // Create FunctionCallData with wmb_receive discriminator and the raw ABI-encoded MessageData
    let funcationCallData = new FunctionCallData([40, 21, 26, 196, 182, 1, 131, 237], rawEvmDataBytes);
    let funcationCallDataByte = funcationCallData.toBorshBytes();

    let inbouCallData = new InboundFunctionCallData(funcationCallDataByte, config.peer.WanChainId, config.peer.WanAppScAddr);
    let inboundCallDataBytes = inbouCallData.toBorshBytes();
    let tranferTokenAppAbi = config.idl.dempApp;
    let contractAddr = new PublicKey(tranferTokenAppAbi.address).toBuffer();
    console.log('contractAddr: ', contractAddr.toString('hex'));

    let encodeInfo = new EncodeInfo(inboundCallDataBytes, Buffer.from(taskId.slice(2), 'hex'), networkId, contractAddr);
    let encodeInfoBytes = encodeInfo.toBorshBytes();

    console.log('encodeInfoBytes length: ', encodeInfoBytes.length);

    // Compose TTL with EncodeInfo bytes for signing
    const ttlBytes = Buffer.allocUnsafe(8);
    ttlBytes.writeBigUInt64LE(BigInt(ttl), 0);
    const dataToSign = Buffer.concat([Buffer.from(encodeInfoBytes), ttlBytes]);
    const sha256hash = keccak256(dataToSign);
    console.log('sha256hash: ', sha256hash.toString('hex'));


    let testPrivkey1 = [89,147,122,71,157,114,182,85,141,123,194,123,223,107,252,86,249,216,50,185,169,63,152,87,56,84,188,163,83,232,60,149];
    const user1_secp256k2_privKey = Buffer.from(testPrivkey1);

    let sig1 = secp256k1.ecdsaSign(sha256hash, user1_secp256k2_privKey);
    console.log('sig1: ', sig1);

    let signatures = [sig1];

    console.log('Signatures for EncodeProof:', signatures);

    console.log('Signature created');

    let encodeProof = new EncodeProof(signatures);
    let encodeProofBuff = encodeProof.toBorshBytes();

    let testEncodeInfoBuf = Buffer.from(encodeInfoBytes);
    let testEndodeProofBuf = Buffer.from(encodeProofBuff);

    let ret = await gateWayApp.inbound_call(taskId,ttl, networkId, messageData,testEncodeInfoBuf, testEndodeProofBuf);

    console.log('ret: ', ret);

    //3tERu3EsT3uaCQfSBbjXppFrJeinQEuMVKDH9nWZTNQqutNU4cUvCkNxnv4arN1VwcNrzK1LB1DWNYpmYcQoeAoC

}

inboundCall();

