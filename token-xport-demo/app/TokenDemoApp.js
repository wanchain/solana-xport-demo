
const anchor = require('@coral-xyz/anchor');

const {getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccount} = require('@solana/spl-token');

const config = require('./config');
const {  SystemProgram, Transaction,  ComputeBudgetProgram, PublicKey} = require("@solana/web3.js");

const {
    findProgramAddress,sleep,findProgramAddressByNumSeed,findProgramAddressByNumSeedTwo
} = require('./utils');
const {Buffer} = require("buffer");

class TokenDemoApp {
    constructor(keypair) {
        this.keypair = keypair;
        this.wallet = new anchor.Wallet(this.keypair);
        this.connection = new anchor.web3.Connection(config.nodeUrl);
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, 'recent');

        this.program = new anchor.Program(config.idl.dempApp, this.provider);
    }

    async getSetting() {
        const settingsPda = findProgramAddress('settings', this.program.programId);

        const settingData = await this.program.account.settings.fetch(settingsPda.publicKey);
        console.log('settingData: ', settingData);
        console.log('gateway: ', settingData.gatewayProgram.toBase58());
        console.log('authority: ', settingData.authority.toBase58());

    }

    async initialize(gatewayAddress) {
        let gatewayPubkey = new PublicKey(gatewayAddress);
        let usdcPubKey =  new PublicKey(config.scAddr.USDC);

        let fundraiser_pda = findProgramAddress('fundraiser', this.program.programId);

        console.log('fundraiser_pda: ', fundraiser_pda);

        const vault = getAssociatedTokenAddressSync(usdcPubKey, fundraiser_pda.publicKey,true);
        console.log('vault: ', vault);

        const settingsPda = findProgramAddress('settings', this.program.programId);

        let instruction = await this.program.methods.initialize(gatewayPubkey).accounts({
            maker:this.keypair.publicKey,
            mintAccount:usdcPubKey,
            fundraiser:fundraiser_pda.publicKey,
            vault,
            settings:settingsPda.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        }).instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(instruction);

        let txHash = await this.connection.sendTransaction(tx, [this.keypair]);

        console.log('txHash: ', txHash);
    }

    async lockToken(amount, gaslimit) {

        let usdcPubKey =  new PublicKey(config.scAddr.USDC);
        let senderToken_Account = getAssociatedTokenAddressSync(usdcPubKey, this.wallet.publicKey);

        let gateway_programPublicKey = new PublicKey(config.scAddr.gateway);

        let fundraiser_pda = findProgramAddress('fundraiser', this.program.programId);

        console.log('fundraiser_pda: ', fundraiser_pda);

        const vault = getAssociatedTokenAddressSync(usdcPubKey, fundraiser_pda.publicKey,true);
        console.log('vault: ', vault);


        //const vault = new PublicKey("GvabFXcod9Uu2ZrgkqjX592xZXvKP6Losz1PYN9rBQET");


        let settingAccount = findProgramAddress('settings',this.program.programId);
        let cpi_signerAccount = findProgramAddress('CpiSigner', this.program.programId);

        const peer_chain_id = new anchor.BN(config.peer.WanChainId);  // Eth chain ID
        const peer_app_address = Buffer.from(config.peer.WanAppScAddr.slice(2), "hex");

        const SOLANA_CHAIN_ID = config.SolanaChainId; // From gate-way constants
        const source_contract_address = this.program.programId.toBytes(); // gw-app program ID
        console.log('source_contract_address: ', this.program.programId.toBase58());
        // Convert numbers to little-endian bytes
        const solanaChainIdBytes = new ArrayBuffer(16);
        const solanaChainIdView = new DataView(solanaChainIdBytes);
        solanaChainIdView.setBigUint64(0, BigInt(SOLANA_CHAIN_ID), true); // little-endian

        const peerChainIdBytes = new ArrayBuffer(16);
        const peerChainIdView = new DataView(peerChainIdBytes);
        peerChainIdView.setBigUint64(0, BigInt(peer_chain_id), true); // little-endian

        const nonceAccount = findProgramAddress('nonce', gateway_programPublicKey,
            [
                Buffer.from(new Uint8Array(solanaChainIdBytes)),
                Buffer.from(new Uint8Array(peerChainIdBytes)),
                Buffer.from(source_contract_address),
                Buffer.from(peer_app_address) // normalized_address (20 bytes, used as-is)
            ])

        const adminBoardPublicKey = new PublicKey(config.scAddr.adminBoardAddr);
        console.log('adminBoardPublicKey: ', adminBoardPublicKey.toBase58())

        const configAccont = findProgramAddress('ConfigData', adminBoardPublicKey);

        console.log('configAccount: ', configAccont.publicKey.toBase58());
        //peer_chain_id:u128, peer_app_address:Vec<u8>,to:Vec<u8>, amount:u64, gas_limit: u64

        let peerUserAddr = config.peer.WanUserAddr;

        let instruction = await this.program.methods.lockToken(
            peer_chain_id,
            peer_app_address,
            Buffer.from(peerUserAddr.slice(2),'hex'),
            new anchor.BN(amount), new anchor.BN(gaslimit)).accounts({

            settings:settingAccount.publicKey,
            cpiSigner:cpi_signerAccount.publicKey,
            gatewayProgram:gateway_programPublicKey,
            nonceAccount:nonceAccount.publicKey,
            configAccount:configAccont.publicKey,
            sender:this.keypair.publicKey,
            mintAccount: usdcPubKey,
            senderTokenAccount: senderToken_Account,
            vault,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,

        }).instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(instruction);

        let txHash = await this.connection.sendTransaction(tx, [this.keypair]);

        console.log('txHash: ', txHash);

    }
    async unlockToken(receipter , amount) {
        let usdcPubKey =  new PublicKey(config.scAddr.USDC);

        let receipterPubkey = new PublicKey(receipter) ;

        let recipteTokenAccount = getAssociatedTokenAddressSync(usdcPubKey, receipterPubkey);

        let fundraiser_pda = findProgramAddress('fundraiser', this.program.programId);

        console.log('fundraiser_pda: ', fundraiser_pda);

        const vault = getAssociatedTokenAddressSync(usdcPubKey, fundraiser_pda.publicKey,true);
        console.log('vault: ', vault);

        let instruction = await this.program.methods.unlockToken(new anchor.BN(amount)).accounts({
            payer: this.keypair.publicKey,
            mintAccount: usdcPubKey,
            receiverTokenAccount: recipteTokenAccount,
            fundraiser:fundraiser_pda.publicKey,
            vault,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,


        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(instruction);

        let txHash = await this.connection.sendTransaction(tx, [this.keypair]);

        console.log('txHash: ', txHash);


    }
    async wmbReceiveAccounts(data) {
        console.log('data: ', data);

        let auxiliaryPda = findProgramAddress('Auxiliary', this.program.programId);

        let result = await this.program.methods.wmbReceiveAccounts(Buffer.from(data.slice(2), 'hex'))
            .accounts({
                auxiliaryPda:auxiliaryPda.publicKey
            }).view();

        console.log('result: ', result);

    }

}

module.exports = TokenDemoApp;