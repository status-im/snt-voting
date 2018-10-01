const utils = require('../utils/testUtils')
const assert = require('assert');
const BN = web3.utils.BN;
var _ = require('lodash');
var rlp = require('rlp');

const PollManager = embark.require('Embark/contracts/PollManager');
const SNT = embark.require('Embark/contracts/SNT');


const decimals = (amount) => web3.utils.toWei(amount.toString(), "ether");

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
    let blockNumber;
    
    before(function(done) {
        web3.eth.getAccounts().then((acc) => { 
            accounts = acc; 
            return SNT.methods.generateTokens(accounts[0], decimals(12)).send();
        }).then(() => { 
            return SNT.methods.generateTokens(accounts[1], decimals(10)).send();
        }).then(() => { 
            return SNT.methods.generateTokens(accounts[2], decimals(12)).send();
        }).then(() => { 
            return SNT.methods.generateTokens(accounts[3], decimals(7)).send();
        }).then(() => {
            return web3.eth.getBlockNumber();
        }).then((block) => {
            blockNumber = block;
            done(); 
        });
    });

    const description = ["Should we ditch Slack for Status.im Desktop?", ["What are we waiting for?", "Let's wait for Windows version first", "Yes, as long as _____ feature is implemented"]];
    const numBallots = 3;
    const encodedDesc = "0x" + rlp.encode(description).toString('hex');

    let pollId;

    it("Creating a proposal without holding SNT should fail", async () => {
        try {
            const receipt = await PollManager.methods.addPoll(
                blockNumber,
                blockNumber + 10, 
                encodedDesc,
                numBallots)
                .send({from: accounts[8]});
            assert.fail('should have reverted before');
        } catch(error) {
            utils.assertJump(error);
        }
    });

    it("A SNT holder can create polls", async () => {
        const blockNumber = (await web3.eth.getBlockNumber()) + 1;

        const receipt = await PollManager.methods.addPoll(
                                blockNumber,
                                blockNumber + 10,
                                encodedDesc,
                                numBallots)
                                .send({from: accounts[0]});

        assert(!!receipt.events.PollCreated, "PollCreated not triggered");

        pollId = receipt.events.PollCreated.returnValues.idPoll;

        console.log("    - Gas used during poll creation: " + receipt.gasUsed);
    });

    it("A user should be able to determine if he can vote", async () => {
        const canVote = await PollManager.methods.canVote(pollId).call({from: accounts[0]});
        assert.equal(canVote, true, "User should be able to vote");
    });

    it("A SNT holder cannot vote if ballots total is greater than current balance", async () => {
        try {
            const receipt = await PollManager.methods.vote(pollId, [decimals(11), decimals(12), decimals(12)]).send({from: accounts[0]});
            assert.fail('should have reverted before');
        } catch(error) {
            utils.assertJump(error);
        }
    });

    it("Should be able to vote if the ballots contain the correct amount", async () => {
        const ballots = [decimals(9), decimals(0), decimals(1)];
        const receipt = await PollManager.methods.vote(pollId, ballots).send({from: accounts[0]});
        assert(!!receipt.events.Vote, "Vote not triggered");
        console.log("    - Gas used during voting: " + receipt.gasUsed);
    });

    it("The option the voter selected must be stored correctly", async() => {
        const ballots = [decimals(9), decimals(0), decimals(1)];

        const contractBallots = await PollManager.methods.getVote(pollId, accounts[0]).call();
        assert.equal(contractBallots[0], ballots[0], "Ballot1 value is incorrect");
        assert.equal(contractBallots[1], ballots[1], "Ballot2 value is incorrect");
        assert.equal(contractBallots[2], ballots[2], "Ballot3 value is incorrect");
    });

    it("More than 1 user should be able to vote", async() => {
        const receipt = await PollManager.methods.vote(pollId, [decimals(4), decimals(4), decimals(1)]).send({from: accounts[2]});
        assert(!!receipt.events.Vote, "Vote not triggered");

        const poll = await PollManager.methods.poll(pollId).call();
        assert.equal(poll._voters, 2, "Invalid number of voters");

    });

    it("Voting when you're not a SNT holder SHOULD FAIL!", async () => {
        try {
            const receipt = await PollManager.methods.vote(pollId, [decimals(1), decimals(2), decimals(3)])
                            .send({from: accounts[8]});
            assert.fail('should have reverted before');
        } catch(error) {
            utils.assertJump(error);
        }
    });

    it("Getting poll information", async () => {
        console.log("    - Decoding poll title: " + (await PollManager.methods.pollTitle(pollId).call()));
        console.log("    - Decoding poll ballot 1: " + (await PollManager.methods.pollBallot(pollId, 0).call()));
        console.log("    - Decoding poll ballot 2: " + (await PollManager.methods.pollBallot(pollId, 1).call()));
        console.log("    - Decoding poll ballot 3: " + (await PollManager.methods.pollBallot(pollId, 2).call()));

        const poll = await PollManager.methods.poll(pollId).call();

        const voters = poll._voters;
      

        // TODO: add tests with voters, and results*
    });

    it("User can unvote", async () => {
        const poll = await PollManager.methods.poll(pollId).call();

        const receipt = await PollManager.methods.unvote(pollId).send({from: accounts[0]});
        assert(!!receipt.events.Unvote, "Unvote not triggered");

        const contractBallots = await PollManager.methods.getVote(pollId, accounts[0]).call();

        assert.equal(contractBallots[0], 0, "Ballot1 value is incorrect");
        assert.equal(contractBallots[1], 0, "Ballot2 value is incorrect");
        assert.equal(contractBallots[2], 0, "Ballot3 value is incorrect");

        const updatedPoll = await PollManager.methods.poll(pollId).call();
        assert.equal(updatedPoll._voters, poll._voters -1, "Number of voters is incorrect")
    });

    it("User can vote again", async () => {
        const ballots = [9, 2, 1];
        const receipt = await PollManager.methods.vote(pollId, ballots).send({from: accounts[0]});
        assert(!!receipt.events.Vote, "Vote not triggered");
    });

});

