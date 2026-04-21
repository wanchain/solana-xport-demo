const anchor = require('@coral-xyz/anchor');
const config = require('./config');

const tokenLocker = ()=> {
    return anchor.web3.Keypair.fromSecretKey(new Uint8Array(config.users.aythority_id));
}

const tokenOperater = () => {
    return anchor.web3.Keypair.fromSecretKey(new Uint8Array(config.users.operator_id));
}

const tokenAgent = ()=> {
    return anchor.web3.Keypair.fromSecretKey(new Uint8Array(config.users.agent_id));
}

module.exports = {
    tokenAgent, tokenLocker, tokenOperater
}

