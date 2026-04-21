const anchor = require('@coral-xyz/anchor');

const {getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccount} = require('@solana/spl-token');

const config = require('./config');
const {  SystemProgram, Transaction,  ComputeBudgetProgram, PublicKey, Connection} = require("@solana/web3.js");
const {tokenOperater} = require("./test_wallets");


const main = async () => {
    let receiptKeypair = tokenOperater();
    let receiptAddr = receiptKeypair.publicKey.toBase58();


    let usdcPubKey =  new PublicKey(config.scAddr.USDC);

    let connection = new Connection(config.nodeUrl);

    let recipteTokenAccount = getAssociatedTokenAddressSync(usdcPubKey,  receiptKeypair.publicKey);
    console.log('recipteTokenAccount: ', recipteTokenAccount);

    //let rect_ata = await createAssociatedTokenAccount(connection, receiptKeypair, usdcPubKey, receiptKeypair.publicKey);

    //console.log('rect_ata: ', rect_ata);
}

main();