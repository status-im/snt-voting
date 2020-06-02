SNT Voting DApp
===

> ROPSTEN
https://ipfs.infura.io/ipfs/Qmd5szquBoyJSEHW53q24UufEoHjCsZeKvFubYucvJ4hU7/#/

## Intro
Hi, welcome to the Status SNT Voting Dapp repo. The Status SNT voting dapp is used to receive signals from the SNT community. The following is an introduction to the Dapp, a guide to cloning this repo, getting it running on your local machine and instructions to modify this Dapp for your own token community. 

The Dapp works on the concept of Quadratic Voting, a concept created by Glen Weyl and Eric Posner. More information can be found here http://radicalmarkets.com/chapters/radical-democracy/

The Dapp uses this concept to produce an interesting voting behavior which:

- Favours large number of voters with low amounts of tokens rather than one voter with many tokens. 
- See users spreading their intent across ballots. 

To prevent "gaming" of the vote the Dapp takes a snapshot of all token accounts and their balances at the block number when the poll is created. These balances are used to inform the amount of votes a wallet address has. This means that users cannot move their tokens around to vote again from multiple accounts. 

That said, this Dapp is not game proof. If the outcome of your vote has financial consequences, it is possible for one user to move their tokens into many accounts proir to a poll been created to have a disproportionate impact on the vote. To do so will require effort and a fair amount of ETH for GAS costs, but it is possible. Therefore we advise you to limit these polls to non-binding votes which are used purely to collect signals or sentiment from your token community. 

## Live Dapp and User Journey 
The Dapp is live on mainnet and used by SNT holders at vote.status.im. If you interested in checking out the user flow and UI, head over there. If you are interested in the UI and UX of token voting dapp, checkout our blog post about the design process: https://our.status.im/designing-the-status-im-voting-dapp/

## Contact 
If you have any questions or queries the whole team is on Status on the status-snt-voting-dapp public chat group which can be opened here on Status mobile: https://join.status.im/status-snt-voting-dapp

## Getting it running on your local machine

1. Install embark following instructions here: https://embark.status.im/docs/installation.html 

2. Execute the following commands:
```
git clone https://github.com/status-im/snt-voting.git
cd snt-voting
npm install
embark simulator
```

While running embark simulator open another terminal tab and enter `embark run` in the snt-voting project directory to start the DApp. 

To test the voting dapp on a local environment, for ease of use open http://localhost:8000 in google chrome incognito mode to use embark's local test wallet. To test the application you may mint test tokens by following http://localhost:8000/#/admin and minting test SNT Token.

## The Contracts

The contracts were originally Giveth’s excellent mini-me and poll manager contracts which may be found here: 

https://github.com/Giveth/minime
https://github.com/Giveth/pollmanager

Giveth’s Poll Manager works by creating a clone of the token at an specific block number for each poll, instant and then voting involves a transfer of these cloned tokens. In practice we found these operations incurred in a considerable gas cost, so, the following changes have been made: 

Tokens aren’t cloned. MiniMeToken provides a useful function for governance purposes called `balanceOfAt` which allows reading the balance at an specific block number (the poll start block number), hence there’s no need of a cloned token nor value transfer.
Storing data in the chain is expensive. The original PollManager contract RLP encoded the poll title and options. We use IPFS to store the poll information, and then the contract has a reference to the IPFS Hash of the poll data.
The original PollManager allows only to vote on a single option with the full balance of the cloned token. Our experimentation of quadratic voting requires us to let the user be able to select the amount of voting power they would allocate to each option.

Our contract PollManager is fully documented using natspec and can be seen at: https://github.com/status-im/snt-voting/blob/new-ui/contracts/polls/PollManager.sol.

## Changing the token

Assuming you would like to use the voting dapp with a MiniMeToken which represents your community you may edit the file ./config/contracts.js. For each environment there’s a configuration for the token which you may set up:

To create a new token:
```
"DappToken": {
    "instanceOf": "MiniMeToken",
    "args": [
        "$MiniMeTokenFactory",
        "0x0000000000000000000000000000000000000000",
        0,
        "TestMiniMeToken",  // Token Name
        18,	// Decimals
        "TST",	// Symbol
        true
    ]
}
```

If you wish to point to an existing token address:
```
“DappToken”: {
    “instanceOf”: “MiniMeToken”,
    “address”: “0x1234567890123456789012345678901234567890”
}
```

## Deployment Details
| Contract                 | Ropsten Address                            | Mainnet Address                            |
| -------------------------|------------------------------------------- | ------------------------------------------ |
| polls/PollManager        | 0x172baf2624e8f52a6c6f2de914169e0864a14344 | 0x167c7c3d434315e4415eb802f0beb9ea44cd1546 |
| token/MiniMeToken (SNT)  | 0xc55cf4b03948d7ebc8b9e8bad92643703811d162 | 0x744d70fdbe2ba4cf95131626614a1763df805b9e |
| token/MiniMeTokenFactory | 0xa1c957C0210397D2d0296341627B74411756d476 | 0xa1c957C0210397D2d0296341627B74411756d476 |

