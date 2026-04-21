const anchor = require("@coral-xyz/anchor");
const borsh = require('borsh2');
const findProgramAddress = (
    label,
    programId,
    extraSeeds
) => {
    const seeds = [Buffer.from(anchor.utils.bytes.utf8.encode(label))];
    if (extraSeeds) {
        for (const extraSeed of extraSeeds) {
            if (typeof extraSeed === "string") {
                seeds.push(Buffer.from(anchor.utils.bytes.utf8.encode(extraSeed)));
            } else if (Array.isArray(extraSeed)) {
                seeds.push(Buffer.from(extraSeed));
            } else if (Buffer.isBuffer(extraSeed)) {
                seeds.push(extraSeed);
            } else {
                seeds.push(extraSeed.toBuffer());
            }
        }
    }
    const res = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
    return { publicKey: res[0], bump: res[1] };
};

const findProgramAddressByNumSeed = (label, id, programId, id_bytes) => {
    let bNID =id;
    if(!anchor.BN.isBN(bNID)){
        bNID = new anchor.BN(id);
    }
    const res = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from(label),
            bNID.toArrayLike(Buffer, "le", id_bytes),
        ],
        programId
    );

    return { publicKey: res[0], bump: res[1] };
}

const findProgramAddressByNumSeedTwo = (label, programId, id1,id1_bytes, id2,id2_bytes) => {
    let bNID =id1;
    if(!anchor.BN.isBN(bNID)){
        bNID = new anchor.BN(id1);
    }
    let bNID2 = id2;
    if(!anchor.BN.isBN(bNID2)){
        bNID2 = new anchor.BN(id2);
    }
    const res = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from(label),
            bNID.toArrayLike(Buffer, "le", id1_bytes),
            bNID2.toArrayLike(Buffer, "le", id2_bytes),
        ],
        programId
    );

    return { publicKey: res[0], bump: res[1] };
}


function sleep(time) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, time);
    })
}
class InboundFunctionCallData {
    constructor(functionCallData, sourceChainId, sourceContract) {
        this.data ={
            functionCallData:functionCallData,
            sourceChainId:sourceChainId,
            sourceContract:sourceContract,

        }
        this.schema = {
            struct:{
                functionCallData:{array:{type:'u8'}},
                sourceChainId:'u128',
                sourceContract:"string",
            }

        }
    }
    toBorshBytes() {
        return borsh.serialize(this.schema, this.data);
    }
    fromBorshBytes(encoded) {
        return borsh.deserialize(this.schema, encoded);
    }
}

class EncodeInfo{
    constructor(_inboundFunctionCallData, _taskId, _networkId, _contractAddr) {
        this.schema = {
            struct:{
                taskId: {array: {type: 'u8'}},
                networkId: 'u128',
                contractAddr: {array: {type: 'u8',len:32}},
                inboundFunctionCallData: {array: {type: 'u8'}}
            }

        }
        this.data = {
            taskId: _taskId,
            networkId: _networkId,
            contractAddr: _contractAddr,
            inboundFunctionCallData: _inboundFunctionCallData
        }
    }

    toBorshBytes() {
        return borsh.serialize(this.schema, this.data);
    }
    fromBorshBytes(encoded) {
        return borsh.deserialize(this.schema, encoded);
    }
}

class EncodeProof {
    constructor(secp256k1_signagures) {
        this.schema = {
            struct:{
                signatures:{
                    array:{
                        type:{
                            struct:{
                                recid:'u8',
                                signature:{array:{type:'u8',len:64}}
                            }
                        }
                    }
                }
            }

        };
        this.data = {
            signatures: secp256k1_signagures
        };
    }
    toBorshBytes() {
        return borsh.serialize(this.schema, this.data);
    }
    fromBorshBytes(encoded) {
        return borsh.deserialize(this.schema, encoded);
    }
}

class FunctionCallData {
    constructor(messageFunc, messageData) {
        this.schema = {
            struct: {
                messageFunc: {array: {type: 'u8'}}, // Instruction discriminator bytes (8 bytes)
                messageData: {array: {type: 'u8'}}
            }
        };
        this.data = {
            messageFunc:messageFunc,
            messageData:messageData,
        }
    }
    toBorshBytes() {
        return borsh.serialize(this.schema, this.data);
    }
    fromBorshBytes(encoded) {
        return borsh.deserialize(this.schema, encoded);
    }

}

class OutboundFunctionCallData {
    constructor(functionCallData, networkId, contractAddress) {
        this.schema = {
            struct:{
                functionCallData:{array:{type:'u8'}},
                networkId:'u128',
                contractAddress:{array:{type:'u8',len:32}},
            }
        }
        this.data = {
            functionCallData: functionCallData,
            networkId: networkId,
            contractAddress: contractAddress
        }
    }
    toBorshBytes() {
        return borsh.serialize(this.schema, this.data);
    }
    fromBorshBytes(encoded) {
        return borsh.deserialize(this.schema, encoded);
    }
}

module.exports ={
    findProgramAddress,
    sleep,
    findProgramAddressByNumSeed,
    findProgramAddressByNumSeedTwo,
    InboundFunctionCallData,
    EncodeInfo,
    EncodeProof, 
    FunctionCallData, 
    OutboundFunctionCallData

}
