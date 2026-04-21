const {
    tokenAgent, tokenLocker, tokenOperater
} = require('./test_wallets');

const config = require('./config');

const TokenDemoApp = require('./TokenDemoApp');

const run = async ()=> {
    let operator= tokenOperater();
    let app = new TokenDemoApp(operator);

    let gatewayScAddr = config.scAddr.gateway;

    await app.initialize(gatewayScAddr);
}

run();
