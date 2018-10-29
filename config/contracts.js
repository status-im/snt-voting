module.exports = {
  // default applies to all environments
  default: {
    // Blockchain node to deploy the contracts
    deployment: {
      host: "localhost", // Host of the blockchain node
      port: 8545, // Port of the blockchain node
      type: "rpc" // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
      /*,accounts: [
        {
          privateKey: "your_private_key",
          balance: "5 ether"  // You can set the balance of the account in the dev environment
                              // Balances are in Wei, but you can specify the unit with its name
        },
        {
          privateKeyFile: "path/to/file", // Either a keystore or a list of keys, separated by , or ;
          password: "passwordForTheKeystore" // Needed to decrypt the keystore file
        },
        {
          mnemonic: "12 word mnemonic",
          addressIndex: "0", // Optionnal. The index to start getting the address
          numAddresses: "1", // Optionnal. The number of addresses to get
          hdpath: "m/44'/60'/0'/0/" // Optionnal. HD derivation path
        }
      ]*/
    },
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],
    gas: "auto",
    contracts: {
      "ERC20Receiver": { "deploy": false },
      "MiniMeToken": { "deploy": false },
      "TestToken": {
      },
      "MiniMeTokenFactory": {

      },
      "SNT": {
        "instanceOf": "MiniMeToken",
        "args": [
          "$MiniMeTokenFactory",
          "0x0000000000000000000000000000000000000000",
          0,
          "TestMiniMeToken",
          18,
          "TST",
          true
        ]
      },
      "PollManager": {
        "args": ["$SNT"]
      },
      "RLPHelper": {
        "deploy": false
      },
      "RLPReader": {
        "deploy": false
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "ws://localhost:8546",
      "http://localhost:8545",
      "$WEB3"  // uses pre existing web3 object if available (e.g in Mist)
    ]
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
    deployment: {
      host: "localhost",
      port: 8545,
      type: "rpc",
      accounts: [
        {
          privateKey: "0x00000...."
        }
      ]
    },
    "contracts": {
      "TestToken": { deploy: false },
      "MiniMeTokenFactory": {
        address: "0x6bfa86a71a7dbc68566d5c741f416e3009804279"
      },
      "SNT": {
        instanceOf: "MiniMeToken",
        address: "0xc55cf4b03948d7ebc8b9e8bad92643703811d162"
      },
      "PollManager": {
        address: "0x172baf2624e8f52a6c6f2de914169e0864a14344"

      }
    }
  },
  
  "testnet_devcoin":{
    deployment: {
      host: "localhost",
      port: 8545,
      type: "rpc",
      accounts: [
        {
          privateKey: "0x00000...."
        }
      ]
    },
    "contracts": {
      "TestToken": { deploy: false },
      "MiniMeTokenFactory": {
        address: "0x6bfa86a71a7dbc68566d5c741f416e3009804279"
      },
      "SNT": {
        instanceOf: "MiniMeToken",
        args: [
          "$MiniMeTokenFactory",
          "0x0000000000000000000000000000000000000000",
          0,
          "Status Core Dev Meeting Token (TEST)",
          18,
          "SCDMT",
          true
        ],
        gasPrice: 5000000000,
        from: "0x00000...."
      },
      "PollManager": {
        args: ["$SNT"],
        gasPrice: 5000000000,
        from: "0x00000...."
      }
    }
  },

  "staging":{
    "contracts": {
      "TestToken": { "deploy": false },
      "MiniMeTokenFactory": {
        "address": "0xa1c957C0210397D2d0296341627B74411756d476"
      },
      "SNT": {
        "instanceOf": "MiniMeToken",
        "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
      },
      "PollManager": 	{
        "address": "0x0e222932911b9a558104b4b4b2f330398561436f"
      }
    }
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    "contracts": {
      "TestToken": { "deploy": false },
      "MiniMeTokenFactory": {
        "address": "0xa1c957C0210397D2d0296341627B74411756d476"
      },
      "SNT": {
        "instanceOf": "MiniMeToken",
        "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
      },
      "PollManager": 	{
        "address": "0x167c7c3d434315e4415eb802f0beb9ea44cd1546"
      }
    }
  },



  livenet_devcoin: {
    deployment: {
      host: "localhost",
      port: 8545,
      type: "rpc",
      accounts: [
        {
          privateKey: "0x00000...."
        }
      ]
    },
    "contracts": {
      "TestToken": { "deploy": false },
      "MiniMeTokenFactory": {
        "address": "0xa1c957C0210397D2d0296341627B74411756d476"
      },
      "SNT": {
        "address": "0x05fD4a5c96c54a17D845D62C6cB00E39D39BeaF4"
      },
      "PollManager": {
        "address": "0x8262dE6Fa74915f0D1E77d3f45de90d02A01E7aE"
      }
    }
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
