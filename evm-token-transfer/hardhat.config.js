require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
 solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "london"
        }
      }
    ]
  },
  mocha: {
    timeout: 100000000
  },

  networks: {
        wantest: {
      url: "https://gwan-ssl.wandevs.org:46891",
      accounts: {
        mnemonic:require("./evm-cli-v4/config").words,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
      chainId: 999,
      gasPrice: 2e9,
      gas: 30000000,
    },
    wanmain: {
      url: "https://gwan-ssl.wandevs.org:56891",
            accounts: {
        mnemonic:require("./evm-cli-v4/config").words,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
      chainId: 888,
      gasPrice: 2e9,
      gas: 30000000,
    },
  }
};
