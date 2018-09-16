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
 
To test the voting dapp on a local enviroment, for ease of use open localhost:8000 in google chrome incognito mode to use embark's local test wallet. To test the application you may mint test tokens by clicking on the hidden test menu button in the header to access a menu where you can mint test tokens. 

![Test menu button](https://user-images.githubusercontent.com/7915365/45599938-6f911680-b9ec-11e8-85cd-e7d06156254f.png)
![Mint Test SNT](https://user-images.githubusercontent.com/7915365/45599951-c39bfb00-b9ec-11e8-8236-a466e8ebb591.png)


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
