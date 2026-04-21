const {
    tokenAgent, tokenLocker, tokenOperater
} = require('./test_wallets');

const config = require('./config');

const TokenDemoApp = require('./TokenDemoApp');

const run = async ()=> {
    let agentKeyPair= tokenAgent(); 
    let app = new TokenDemoApp(agentKeyPair);
    let amount = 8;

    let receiptKeypair = tokenOperater();
    let receiptAddr = receiptKeypair.publicKey.toBase58();

    await app.unlockToken(receiptAddr,amount);
}

run();