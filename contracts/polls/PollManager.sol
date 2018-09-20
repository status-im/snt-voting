pragma solidity ^0.4.23;

import "../common/Controlled.sol";
import "../token/MiniMeToken.sol";
import "../rlp/Helper.sol";


contract PollManager is Controlled {

    struct Poll {
        uint startBlock;
        uint endBlock;
        bool canceled;
        uint voters;
        bytes description;
        uint8 numBallots;
        mapping(uint8 => mapping(address => uint)) ballots;
        mapping(uint8 => uint) qvResults;
        mapping(uint8 => uint) results;
        address author;
    }

    Poll[] _polls;

    MiniMeToken public token;

    Helper public rlpHelper;

    constructor(address _token) 
        public {
        token = MiniMeToken(_token);
        rlpHelper = new Helper();
    }

    modifier onlySNTHolder {
        require(token.balanceOf(msg.sender) > 0, "SNT Balance is required to perform this operation"); 
        _; 
    }

    function addPoll(
        uint _startBlock,
        uint _endBlock,
        bytes _description,
        uint8 _numBallots)
        public
        onlySNTHolder
        returns (uint _idPoll)
    {
        require(_endBlock > block.number, "End block must be greater than current block");
        require(_startBlock >= block.number && _startBlock < _endBlock, "Start block must not be in the past, and should be less than the end block" );
        
        _idPoll = _polls.length;
        _polls.length ++;
        Poll storage p = _polls[_idPoll];
        p.startBlock = _startBlock;
        p.endBlock = _endBlock;
        p.voters = 0;
        p.numBallots = _numBallots;
        p.description = _description;
        p.author = msg.sender;

        emit PollCreated(_idPoll); 
    }

    function updatePollDescription(
        uint _idPoll, 
        bytes _description,
        uint8 _numBallots)
        public
    {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];
        require(p.startBlock > block.number, "You cannot modify an active poll");
        require(p.author == msg.sender || msg.sender == controller, "Only the owner can modify the poll");

        p.numBallots = _numBallots;
        p.description = _description;
        p.author = msg.sender;
    }

    function cancelPoll(uint _idPoll) 
        public
        onlyController {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];

        require(p.endBlock < block.number, "Only active polls can be canceled");

        p.canceled = true;

        emit PollCanceled(_idPoll);
    }

    function canVote(uint _idPoll) 
        public 
        view 
        returns(bool)
    {
        if(_idPoll >= _polls.length) return false;

        Poll storage p = _polls[_idPoll];
        uint balance = token.balanceOfAt(msg.sender, p.startBlock);
        return block.number >= p.startBlock && block.number < p.endBlock && !p.canceled && balance != 0;
    }
    

    function sqrt(uint256 x) public pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function vote(uint _idPoll, uint[] _ballots) public {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];

        require(block.number >= p.startBlock && block.number < p.endBlock && !p.canceled, "Poll is inactive");
        require(_ballots.length == p.numBallots, "Number of ballots is incorrect");

        unvote(_idPoll);

        uint amount = token.balanceOfAt(msg.sender, p.startBlock);
        require(amount != 0, "No SNT balance available at start block of poll");

        p.voters++;

        uint totalBallots = 0;
        for(uint8 i = 0; i < _ballots.length; i++){
            totalBallots += _ballots[i];

            p.ballots[i][msg.sender] = _ballots[i];

            if(_ballots[i] != 0){
                p.qvResults[i] += sqrt(_ballots[i] / 1 ether);
                p.results[i] += _ballots[i];
            }
        }

        require(totalBallots <= amount, "Total ballots must be less than the SNT balance at poll start block");

        emit Vote(_idPoll, msg.sender, _ballots);
    }

    function unvote(uint _idPoll) public {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];
        
        require(block.number >= p.startBlock && block.number < p.endBlock && !p.canceled, "Poll is inactive");

        if(p.voters == 0) return;

        p.voters--;

        for(uint8 i = 0; i < p.numBallots; i++){
            uint ballotAmount = p.ballots[i][msg.sender];

            p.ballots[i][msg.sender] = 0;

            if(ballotAmount != 0){
                p.qvResults[i] -= sqrt(ballotAmount / 1 ether);
                p.results[i] -= ballotAmount;
            }
        }

        emit Unvote(_idPoll, msg.sender);
    }

    // Constant Helper Function

    function nPolls()
        public
        view 
        returns(uint)
    {
        return _polls.length;
    }

    function poll(uint _idPoll)
        public 
        view 
        returns(
        uint _startBlock,
        uint _endBlock,
        bool _canVote,
        bool _canceled,
        bytes _description,
        uint8 _numBallots,
        bool _finalized,
        uint _voters
    )
    {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];

        _startBlock = p.startBlock;
        _endBlock = p.endBlock;
        _canceled = p.canceled;
        _canVote = canVote(_idPoll);
        _description = p.description;
        _numBallots = p.numBallots;
        _finalized = (!p.canceled) && (block.number >= _endBlock);
        _voters = p.voters;
    }

    function pollTitle(uint _idPoll) public view returns (string){
        require(_idPoll < _polls.length, "Invalid _idPoll");
        Poll memory p = _polls[_idPoll];

        return rlpHelper.pollTitle(p.description);
    }

    function pollBallot(uint _idPoll, uint ballotNum) public view returns (string){
        require(_idPoll < _polls.length, "Invalid _idPoll");
        Poll memory p = _polls[_idPoll];

        return rlpHelper.pollBallot(p.description, ballotNum);
    }


    function pollResults(uint _idPoll, uint8 ballot)
        public
        view
        returns (uint tokenTotal, uint quadraticVotes) {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];

        require(ballot < p.numBallots, "Invalid ballot");

        tokenTotal = p.results[ballot];
        quadraticVotes = p.qvResults[ballot]; 
    }


    function getVote(uint _idPoll, address _voter, uint8 ballot) 
        public 
        view 
        returns (uint tokenTotal)
    {
        require(_idPoll < _polls.length, "Invalid _idPoll");

        Poll storage p = _polls[_idPoll];

        require(ballot < p.numBallots, "Invalid ballot");

        return  p.ballots[ballot][_voter];
    }

    event Vote(uint indexed idPoll, address indexed _voter, uint[] ballots);
    event Unvote(uint indexed idPoll, address indexed _voter);
    event PollCanceled(uint indexed idPoll);
    event PollCreated(uint indexed idPoll);
}
