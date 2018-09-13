# status.im contracts

Usage: 
 ```
 npm install -g embark
 git clone https://github.com/status-im/snt-voting.git
 cd contracts
 npm install
 embark simulator
 ```
 While running `embark simulator` open another terminal and enter `embark run` in the project directory to start the dapp


## Deployment Details
| Contract                 | Ropsten Address                            | Mainnet Address                            |
| -------------------------|------------------------------------------- | ------------------------------------------ |
| polls/PollManager        | 0x456E047eDEa0a91a66C3DC7aCc0B1424d80cf8a6 | 0x0e222932911b9a558104b4b4b2f330398561436f |
| token/MiniMeToken (SNT)  | 0xc55cf4b03948d7ebc8b9e8bad92643703811d162 | 0x744d70fdbe2ba4cf95131626614a1763df805b9e |
| token/MiniMeTokenFactory | 0xa1c957C0210397D2d0296341627B74411756d476 | 0xa1c957C0210397D2d0296341627B74411756d476 |


## Details
| Contract                               | Deploy | Test | UI  |
| -------------------------------------- | ------ | ---- | --- |
| token/TestToken                        | Yes    | Yes  | Yes |
| token/ERC20Token                       | No     | Yes  | Yes |
| deploy/Instance                        | No     | No   | No  |
| deploy/Factory                         | No     | No   | No  |
