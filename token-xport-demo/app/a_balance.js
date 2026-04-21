
const {PublicKey}  = require("@solana/web3.js");

const config = require('./config');
const Solchain = require('./SolChain');
let users = [
    config.users.authority_addr, config.users.operator_addr,config.users.agent_addr
]
let USDC = config.scAddr.USDC;
const main = async ()=>{
    let chain = new Solchain(config.nodeUrl);

    for(let i = 0; i < users.length; i++ ) {
        let balance = await  chain.getBalance(new PublicKey(users[i]));
        console.log('balance: ', balance);

        let usdcBalance = await  chain.getTokenBalance(users[i], USDC);
        console.log('usdcBalance: ', usdcBalance);
    }



}
const test = async ()=> {
    let chain = new Solchain("https://solana-devnet.g.alchemy.com/v2/E1Ud7jq5q6jm17SodB2wjkPZsTp5lxrj");
    let txHash = "4jvo2aKaXxVRdedY9NfBNSW2kcoJ1Yn1gRBRB3joAxzAnqmHctmNF1jFKFbhQ9wkWgG2coPQReyaQfgnLVNah6VH";
    let tx = await chain.getTransaction(txHash);
    console.log('tx: ', tx);

}
test();
//main();