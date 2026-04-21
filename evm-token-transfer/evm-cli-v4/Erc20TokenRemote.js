const { ethers } = require('ethers');
const abi = require('./abi/ERC20TokenRemote.json');
class Erc20TokenRemote {
    constructor(nodeUrl, scAddr) {
        this.provider = new ethers.providers.JsonRpcProvider(nodeUrl);
        this.scInst = new ethers.Contract(scAddr, abi,this.provider);

    }
    async send(wallet, to, amount) {
        let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);

        let tx = await signedSc.send(to, amount,{
            gasLimit:10000000,
        });
        let ret = await tx.wait();
        console.log('ret: ', ret);
    }
    async getWmbGateWay() {
        let ret = await this.scInst.wmbGateway();
        return ret;
    }
    async setTrustedRemote(wallet, chainId, solScAddr) {
        let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);
        let tx = await signedSc.setTrustedRemote(chainId, solScAddr, true);
        let ret = await tx.wait();
        console.log('ret: ', ret);
    }
    async getTrustedRemote( chainId, solScAddr) {
        let ret = await this.scInst.trustedRemotes(chainId, solScAddr);
        return ret;
    }

    async  wmbReceiveNonEvm(wallet, data,messageId,fromChainId,from) {
        let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);
        let tx = await signedSc.wmbReceiveNonEvm(data, messageId, fromChainId, from);
        let ret = await tx.wait();
        console.log('ret: ', ret);

    }
    async getTokenBalance(address) {

        let ret = await this.scInst.balanceOf(address);
        return ret;
    }
    async updateHomeAddress(wallet, homeScAddr,homeChainId) {
        let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);
        let tx = await signedSc.updateHomeAddress(homeScAddr,homeChainId);
        let ret = await tx.wait();
        console.log('ret: ', ret);
        return ret;
    }
    async getHomeAddress() {
        return await this.scInst.homeAddress();
    }
    async getHomeChainId() {
        return await this.scInst.homeChainId();
    }
    async updateWmbGateway(wallet, address) {
        let signer = wallet.connect(this.provider);
        let signedSc = this.scInst.connect(signer);
        let tx = await signedSc.updateWmbGateway(address);
        let ret = await tx.wait();
        console.log('ret: ', ret);
        return ret;
    }

}

module.exports = Erc20TokenRemote;