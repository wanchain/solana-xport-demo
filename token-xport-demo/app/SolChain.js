
const { Connection, Keypair, PublicKey, TransactionMessage, GetVersionedTransactionConfig,
    VersionedMessage, VersionedTransaction, BlockhashWithExpiryBlockHeight, TransactionInstruction,
    Transaction, Signer,
    SystemProgram } = require('@solana/web3.js');

const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getMint,
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    createTransferInstruction,getAssociatedTokenAddressSync

} = require('@solana/spl-token');

const TimeoutPromise = require('./timeoutPromise');
const CONN_TIME_OUT = 10 * 30* 1000 * 2;
class SolChain {
    constructor(nodeUrl) {
        this.nodeUrl = nodeUrl;
        this.connection = new Connection(this.nodeUrl, {disableRetryOnRateLimit:true});
        this.logger = console;
    }
    async getBalance(pubKey) {
        try {
            const reqPromise =this.connection.getBalance(pubKey);
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getBalance, e: ",e );
            throw e;
        }
    }
    async getBlockHeight() {
        try{
            const reqPromise =   this.connection.getSlot({commitment:"finalized"});
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getBlockHeight, e: ",e );
            throw e;
        }

    }
    async getBlock(slot) {
        try{
            const reqPromise =    this.connection.getBlock(slot, {commitment: "finalized", maxSupportedTransactionVersion: 0, rewards:false});
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getBlock, e: ",e );
            throw e;
        }


    }
    async getBlocks(startSlot, endSlot) {
        try{
            const reqPromise =      this.connection.getBlocks(startSlot, endSlot, {commitment: "finalized", maxSupportedTransactionVersion: 0, rewards:false});
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getBlock, e: ",e );
            throw e;
        }


    }

    async getTransaction(signature,commitment='finalized') {
        try {
            const reqPromise  = this.connection.getTransaction(signature, {commitment:commitment, maxSupportedTransactionVersion: 0});
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getTransaction, e: ",e );
            throw e;
        }

    }
    async getAddressLookupTable(lookUptablePk) {
        try {
            const reqPromise  = this.connection.getAddressLookupTable(lookUptablePk);
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getAddressLookupTable, e: ",e );
            throw e;
        }
    }

    async getSignatureStatus(signaure) {
        try {
            const reqPromise  = this.connection.getSignatureStatus(signature);
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("getSignatureStatus, e: ",e );
            throw e;
        }
    }
    async sendTransaction(transaction, keypair) {
        try {

            const reqPromise  =  this.connection.sendTransaction( transaction, keypair);
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error("sendTransaction, e: ",e );
            throw e;
        }

    }
    async sendRawTransaction(rawTx) {
        try {

            const reqPromise = this.connection.sendRawTransaction(rawTx);
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error('sendRawTransaction, e: ',e);
            throw  e;
        }

    }
    async getLatestBlockhash() {
        try{
            let reqPromise = this.connection.getLatestBlockhash();
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }
        catch (e) {
            this.logger.error('getLatestBlockhash, e: ',e);
            throw  e;
        }
    }
    async getAccountInfo(publicKey) {
        try{
            let reqPromise = this.connection.getAccountInfo(publicKey, {commitment:"finalized"});
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;

            return ret;
        }catch (e) {
            this.logger.error('getAccountInfo, e:',e);
            throw e;
        }
    }
    async getSignaturesForAddress(programPubKey,until,before,limit){
        console.log('programPubKey: ', programPubKey);
        console.log('until: ', until);
        console.log('before: ', before);
        console.log('limit: ', limit);
        try{
            let reqPromise = this.connection.getSignaturesForAddress(programPubKey,{ until:until,before:before, limit:limit},"finalized");
            const reqPromiseWithTimeout = new TimeoutPromise(reqPromise, CONN_TIME_OUT);
            let ret = await reqPromiseWithTimeout;
            return ret;
        }catch (e) {
            this.logger.error('getSignaturesForAddress, e:',e);
            throw e;
        }
    }
    async sendSol(fromKeypair, toPubkey, lamportsToSend) {
        let instruction = SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPubkey,
            lamports: lamportsToSend
        })
        let signature = await this.sendInstractions(fromKeypair, fromKeypair.publicKey, [instruction]);
        return signature;
    }

    async sendInstractions(fromPk, payerPk, instractions) {
        let latestBlockhash = await this.getLatestBlockhash();

        if (latestBlockhash) {

            let messageV0 = new TransactionMessage({ payerKey: payerPk, recentBlockhash: latestBlockhash.blockhash, instructions: instractions }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            transaction.sign([fromPk]);
            let rawTx = transaction.serialize();

            let txHash = await this.sendRawTransaction(rawTx);
            return txHash;
        }

    }
    async getTokenBalance(walletAddress, tokenMintAddress) {
        let log = this.logger;
        let client = this.connection;


        return new TimeoutPromise(async function (resolve, reject) {
            try {
                const tokenAccounts = await client.getParsedTokenAccountsByOwner(
                    new PublicKey(walletAddress),
                    {
                        programId: TOKEN_PROGRAM_ID,
                    }
                );
                log.debug('Client.getTokenBalance, getParsedTokenAccountsByOwner,  tokenAccounts', JSON.stringify(tokenAccounts));

                const tokenAccount = tokenAccounts.value.find(
                    accountInfo => accountInfo.account.data.parsed.info.mint === tokenMintAddress
                );
                log.debug('Client.getTokenBalance, tokenMintAddress', tokenMintAddress, 'tokenAccount', JSON.stringify(tokenAccount));

                if (tokenAccount) {
                    const balance = await client.getTokenAccountBalance(tokenAccount.pubkey,"confirmed");
                    log.debug(`Client.getTokenBalance, Token ${tokenMintAddress} tokenAccount ${tokenAccount.pubkey} Balance: ${JSON.stringify(balance.value)}`);
                    resolve(balance.value.amount);
                } else {
                    log.warn(`Client.getTokenBalance, Token account not found, walletAddress ${walletAddress} tokenMintAddress ${tokenMintAddress}`);
                    resolve(0);
                }
            } catch (err) {
                reject(err);
            }
        }, CONN_TIME_OUT, "solana  getTokenBalance timeout");

    }




}

module.exports = SolChain;
