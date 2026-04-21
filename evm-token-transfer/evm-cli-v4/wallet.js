const { ethers } = require('ethers');

let words = "skate weird total slim gossip company unfold acid slide narrow hammer whale";

let wallet = ethers.Wallet.fromMnemonic(words)

console.log('wallet: ', wallet.address);