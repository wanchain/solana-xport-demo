const {
    tokenAgent, tokenLocker, tokenOperater
} = require('./mainnet_wallets');

const config = require('./config');

const TokenDemoApp = require('./TokenDemoApp');

const run = async ()=> {
    let operator= tokenOperater();
    let app = new TokenDemoApp(operator);

    let gatewayScAddr = config.scAddr.gateway;
    let peerScAddr = config.peer.WanAppScAddr;

    await app.initialize(gatewayScAddr, peerScAddr);
}

run();
