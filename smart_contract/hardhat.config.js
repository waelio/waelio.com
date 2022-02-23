require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/b3k49M_4Zya7CGFAUDnx8h71a1Xf6hIv',
      accounts: ['004ae7e8f3a7575c1b756a82b76a2ab08f8d5e2e0f360f3205678dbd2d5a4f17'],
    },
  },
};