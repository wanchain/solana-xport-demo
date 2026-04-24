

const anchor = require('@coral-xyz/anchor');

const {getAssociatedTokenAddressSync} = require('@solana/spl-token');

const config = require('./config');
const {  SystemProgram, Transaction,  ComputeBudgetProgram, PublicKey} = require("@solana/web3.js");

const {
    findProgramAddress,sleep,findProgramAddressByNumSeed,findProgramAddressByNumSeedTwo
} = require('./utils');
const {Buffer} = require("buffer");

class GateWayApp {
    constructor(keypair) {
        this.keypair = keypair;
        this.wallet = new anchor.Wallet(this.keypair);
        this.connection = new anchor.web3.Connection(config.nodeUrl);
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, 'recent');

        this.program = new anchor.Program(config.idl.gate_way, this.provider);
    }

    async inbound_call(taskId,ttl, networkId, data, encodeInfoBuf, encodeProofBuf) {

        let signer = this.keypair;

        let tranferTokenAppIdl = config.idl.demoApp;
        let tranferTokenAppAddr= tranferTokenAppIdl.address;
        let tranferTokenAppAccount = new PublicKey(tranferTokenAppAddr);

        let gatewayprogramIdPubKey = this.program.programId;

        let cpiAuthorityAccount = findProgramAddress('CpiSigner', gatewayprogramIdPubKey);
        let taskIdHistoryAccount = findProgramAddress('TaskID', gatewayprogramIdPubKey,[Buffer.from(taskId.slice(2), 'hex')]);


        let gatewayAdminPubkey = new PublicKey(config.scAddr.adminBoardAddr);
        let gatewayAdminConfigAccount = findProgramAddress('ConfigData', gatewayAdminPubkey);

        let leader = this.keypair;
        let leaderWallet = new anchor.Wallet(leader);

        const provider = new anchor.AnchorProvider(this.connection, leaderWallet, 'confirmed');

        let tranferTokenProgram = new anchor.Program(tranferTokenAppIdl, provider);

        let messageData = data;
        const auxiliaryPda = findProgramAddress('Auxiliary', tranferTokenAppAccount);

        const result = await tranferTokenProgram.methods
            .wmbReceiveAccounts(Buffer.from(messageData.slice(2),'hex'))
            .accounts({
                auxiliaryPda: auxiliaryPda.publicKey,
            })
            .view();

        console.log('inbound_call, result: ', result);

        let remainingAccounts = result.accounts;


        let tx = new Transaction();

        let units = 1500000;
        let unitPrice = 1000;

        tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: units }));
        tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: unitPrice }));

        let accounts = {
            signer:signer.publicKey,
            appProgram:tranferTokenAppAccount,
            cpiAuthority:cpiAuthorityAccount.publicKey,
            taskIdHistory:taskIdHistoryAccount.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            adminBoardProgram:gatewayAdminPubkey,
            configAccount:gatewayAdminConfigAccount.publicKey,

        }

        let methodTx = await this.program.methods.inboundCall(
            Buffer.from(taskId.slice(2),'hex'),
            new anchor.BN(ttl), new anchor.BN(networkId), encodeInfoBuf, encodeProofBuf).accounts(accounts)
            .remainingAccounts(remainingAccounts)
            .instruction();
        tx.add(methodTx);

        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;


        let ret = await this.connection.sendTransaction(tx, [this.keypair]);

        console.log('ret: ', ret);
    }

}

module.exports = GateWayApp;