const anchor = require('@coral-xyz/anchor');
const config = require('./config');


function parseSecretKeyFromEnv(envKey) {
    const raw = process.env[envKey];
    if (!raw) return null;

    const s = raw.trim();

    // JSON array: "[1,2,3,...]"
    if (s.startsWith("[")) {
        const arr = JSON.parse(s);
        if (!Array.isArray(arr)) throw new Error(`${envKey} must be a JSON number array`);
        return Uint8Array.from(arr);
    }

    // JSON file path: "/abs/path/id.json" or "./id.json"
    if (s.endsWith(".json")) {
        const arr = require(s);
        if (!Array.isArray(arr)) throw new Error(`${envKey} json must export a number array`);
        return Uint8Array.from(arr);
    }

    throw new Error(
      `${envKey} unsupported format. Use JSON array string or a .json file path`,
    );
}

const tokenLocker = ()=> {
    // return anchor.web3.Keypair.fromSecretKey(new Uint8Array(config.users.aythority_id));
    throw new Error("TO BE DONE")
}

const tokenOperater = () => {
    const mainnetWallet = parseSecretKeyFromEnv("MAINNET_WALLET");

    if (mainnetWallet) {
        console.log("tokenOperater() use mainnet wallet ...");
        return anchor.web3.Keypair.fromSecretKey(mainnetWallet);
    }
    else {
        throw new Error("Please set env var MAINNET_WALLET for operator")
    }
}

const tokenAgent = ()=> {
    // return anchor.web3.Keypair.fromSecretKey(new Uint8Array(config.users.agent_id));
    throw new Error("TO BE DONE")
}

module.exports = {
    tokenAgent, tokenLocker, tokenOperater
}

