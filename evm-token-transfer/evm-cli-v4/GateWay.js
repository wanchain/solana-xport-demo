const { ethers } = require('ethers');
const abi = require('./abi/gateway.json')

class GateWay {
    constructor(nodeUrl, scAddr) {
        this.provider = new ethers.providers.JsonRpcProvider(nodeUrl);
        this.scInst = new ethers.Contract(scAddr, abi,this.provider);

    }
    async checkSupportChainid(chainId) {
        let ret = await this.scInst.supportedDstChains(chainId);
        return ret;
    }

    async maxGasLimit() {
        return await this.scInst.maxGasLimit();
    }
    async minGasLimit() {
        return await this.scInst.minGasLimit();
    }

    async receiveMessageNonEvm(wallet, messageId, sourceChainId, sourceContract, targetContract, messageData, gasLimit, smgId, r, s) {
                let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);
        let tx = await signedSc.receiveMessageNonEvm(messageId, sourceChainId, sourceContract, targetContract, messageData, gasLimit, smgId, r,s);
        let ret = await tx.wait();
        console.log('ret: ', ret);

    }

}

module.exports = GateWay;