"use strict";


let Web3 = require('web3');
let web3 = new Web3(null);

const Web3_1_2 = require("web3_1.2");
const web3_1_2 = new Web3_1_2();

let SolidityEvent = require("web3/lib/web3/event.js");
let SolidityFunction = require("web3/lib/web3/function.js");

const web3EthAbi = require("web3-eth-abi");

module.exports = class Contract {
    constructor(abi, contractAddr) {
        this.abi = abi;
        if (contractAddr) {
            this.setContractAddr(contractAddr);
        }
        this.setParseAble(true);
        this.setEncodeAble(true);
    }

    setParseAble(able) {
        this.parseable = able;
    }

    setEncodeAble(able) {
        this.encodeable = able;
    }

    setContractAddr(contractAddr) {
        if (/^0x[0-9a-f]{40}$/i.test(contractAddr)) {
            this.contractAddr = contractAddr;
        } else {
            this.contractAddr = null;
        }
    }

    getSolInferface(contractFunc) {
        let contract = web3.eth.contract(this.abi);
        let conInstance = contract.at(this.contractAddr);
        return conInstance[contractFunc];
    }

    getSolInterfaceV2(contractFunc) {
        let contract = new web3_1_2.eth.Contract(this.abi, this.contractAddr);
        return contract.methods[contractFunc];
    }

    getFuncSignature(funcName) {
        return this.abi.filter((json) => {
            return json.type === 'funciton' && json.name === funcName;
        }).map((json) => {
            return new SolidityFunction(null, json, null);
        }).map((func) => {
            return '0x' + func.signature();
        })
    }

    getEventSignature(eventName) {
        return this.abi.filter((json) => {
            return json.type === 'event' && json.name === eventName;
        }).map((json) => {
            return web3EthAbi.encodeEventSignature(json);
        })
    }

    parseEvents(events) {
        if (events === null || !Array.isArray(events)) {
            return events;
        }
        return events.map((event) => {
            return this.parseEvent(event);
        });
    }

    parseEvent(event) {
        // for eos chain, no need to parse
        if (event === null || !this.contractAddr || !this.parseable) {
            return event;
        }

        let abiJson = this.abi.find(function (json) {
            return (json.type === 'event' && web3EthAbi.encodeEventSignature(json) === event.topics[0]);
        });
        //console.log(abiJson);
        if (abiJson) {
            try {
                //topics without the topic[0] if its a non-anonymous event, otherwise with topic[0].
                event.topics.splice(0, 1);
                let args = web3EthAbi.decodeLog(abiJson.inputs, event.data, event.topics);
                for (var index = 0; index < abiJson.inputs.length; index++) {
                    if (args.hasOwnProperty(index)) {
                        delete args[index];
                    }
                }
                event.event = event.event || abiJson.name;
                event.args = args;
                delete event.data;
                delete event.topics;
                return event;
            } catch (err) {
                console.log("parseLogs catch err:", err);
            }
        }

    }

    constructData(funcName, ...para) {
        if (!this.encodeable) {
            return {
                method: funcName,
                inputs: para
            }
        }
        if (global.isRelay) {
            let funcInterface = this.getSolInterfaceV2(funcName);

            if (funcInterface) {
                // web3 0.20 have getData, web3 1.2 change to encodeABI
                return funcInterface(...para).encodeABI();
            } else {
                return null;
            }
        } else {
            let funcInterface = this.getSolInferface(funcName);

            if (funcInterface) {
                return funcInterface.getData(...para);
            } else {
                return null;
            }
        }
    }
}