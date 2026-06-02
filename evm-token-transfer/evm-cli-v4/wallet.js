const { ethers } = require('ethers');

let words = "";

let wallet = ethers.Wallet.fromMnemonic(words)

console.log('wallet: ', wallet.address);