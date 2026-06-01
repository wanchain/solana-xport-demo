const {
    tokenAgent, tokenLocker, tokenOperater
} = require('./mainnet_wallets');

const config = require('./config');

const TokenDemoApp = require('./TokenDemoApp');

const run = async ()=> {
    let operator= tokenOperater();
    let app = new TokenDemoApp(operator);
    await app.getSetting();


}

run();
