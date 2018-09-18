const utils = require('../utils/testUtils')
const assert = require('assert');
const BN = web3.utils.BN;
var _ = require('lodash');
var rlp = require('rlp');

config({
  contracts: {
    "MiniMeTokenFactory": {
        "gasLimit": 4000000
    },
    "MiniMeToken": {
        "deploy": false,
    },
    "SNT":{
        "instanceOf": "MiniMeToken",
        "args": [
            "$MiniMeTokenFactory",
            utils.zeroAddress,
            0,
            "TestMiniMeToken",
            18,
            "TST",
            true
        ],
        "gasLimit": 4000000
    },
    "PollManager": {
        "deploy": true,
        "args": ["$SNT"]
    }
  }
});

describe("VotingDapp", function () {
    this.timeout(0);

    let accounts;
    
    before(function(done) {
        
        web3.eth.getAccounts().then((acc) => { 
            accounts = acc; 
            return SNT.methods.generateTokens(accounts[0], 12).send()
        }).then((receipt) => { 
            return SNT.methods.generateTokens(accounts[1], 12).send()
        }).then((receipt) => { 
            return SNT.methods.generateTokens(accounts[2], 10).send()
        }).then((receipt) => { 
            return SNT.methods.generateTokens(accounts[3], 7).send()
        }).then((receipt) => {
            done(); 
        });
    });

    it("Test", async () => {

        const blockNumber = await web3.eth.getBlockNumber();
        let description = ["Should we ditch Slack for Status.im Desktop?", ["What are we waiting for?", "Let's wait for Windows version first", "Yes, as long as _____ feature is implemented"]];
        const numBallots = 3;
        let receipt;

        const encodedDesc = "0x" + rlp.encode(description).toString('hex');

     /*   // ===================================================
        // Creating a proposal without holding SNT SHOULD FAIL!
        try {
            receipt = await PollManager.methods.addPoll(
                blockNumber + 10, 
                encodedDesc,
                numBallots)
                .send({from: accounts[8]});
            assert.fail('should have reverted before');
        } catch(error) {
            utils.assertJump(error);
        }*/
        
        
        // ===================================================
        // Creating a proposal as a SNT holder
        receipt = await PollManager.methods.addPoll(
                                blockNumber + 10,
                                encodedDesc,
                                numBallots)
                                .send({from: accounts[0]});

        assert(!!receipt.events.PollCreated, "PollCreated not triggered");

        const pollId = receipt.events.PollCreated.returnValues.idPoll;
       let poll = await PollManager.methods.poll(pollId).call();

        console.log("  - Gas used during poll creation: " + receipt.gasUsed);


        // ===================================================
        // Determining if I can vote por a proposal
        let canVote = await PollManager.methods.canVote(pollId).call({from: accounts[0]});
        assert.equal(canVote, true, "User should be able to vote");


        // TODO: Voter has SNT, but ballots total is greater than balance


        // ===================================================
        // Valid Vote
        receipt = await PollManager.methods.vote(pollId, [9, 1, 2]).send({from: accounts[0]});
        assert(!!receipt.events.Vote, "Vote not triggered");
        console.log("  - Gas used during voting: " + receipt.gasUsed);


        /* TODO:
        // ===================================================
        // Getting what option the voter selected
        let myVote = await PollManager.methods.getVote(pollId, accounts[0]).call();
        const balance = await SNT.methods.balanceOf(accounts[0]).call();
        assert.equal(myVote, balance, "Vote is different from selected");
            */

        
        // ===================================================
        // Voting when you're not a SNT holder SHOULD FAIL!
        try {
            receipt = await PollManager.methods.vote(pollId, [1, 2, 3])
                            .send({from: accounts[8]});
            assert.fail('should have reverted before');
        } catch(error) {
            utils.assertJump(error);
        }


        // ===================================================
        // Getting poll data
        console.log("  - Decoding poll title: " + (await PollManager.methods.pollTitle(pollId).call()));
        console.log("  - Decoding poll ballot 1: " + (await PollManager.methods.pollBallot(pollId, 0).call()));
        console.log("  - Decoding poll ballot 2: " + (await PollManager.methods.pollBallot(pollId, 1).call()));




        // ===================================================
        // Getting proposal information
        // poll = await PollManager.methods.poll(pollId).call();
        


        /*let tokenVotes = poll._results;
        let quadraticVotes = poll._qvResults;
        let voters = poll._voters;

        // Will contain state of the poll
        // console.dir(poll);

        // Contains how many voters
        // console.log(voters); 

        // Contains how many votes using quadratic voting
        // console.log(quadraticVotes);

        // Contains how many votes
        // console.log(tokenVotes); 

        */


        // ===================================================
        // Unvote
        receipt = await PollManager.methods.unvote(pollId).send({from: accounts[0]});
        assert(!!receipt.events.Unvote, "Unvote not triggered");


        console.log("\n");
    });

});

