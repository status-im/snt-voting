import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withRouter } from 'react-router-dom'

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  thumb: {
    width: '24px',
    height: '24px'
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

const arraysEqual = (arr1, arr2) => {
  if(arr1.length !== arr2.length)
      return false;
  for(var i = arr1.length; i--;) {
      if(arr1[i] !== arr2[i])
          return false;
  }
  return true;
}

class PollVoting extends Component {

  state = {
    votes: [],
    originalVotes: [],
    t: new Date()
  }

  componentDidMount(){
    const {polls, originalVotes, idPoll, history} = this.props;

    if(!polls || !polls.length){
      history.push('/');
      return;
    }

    const poll = polls[idPoll];

    const votes = [];
    if(originalVotes.length){
      for(let i = 0; i < poll._numBallots; i++){
        votes[i] = originalVotes[i];
      }
    }

    this.setState({
      originalVotes,
      votes
    });
  }

  updateVotes = i => numVotes => {
    const votes = this.state.votes;
    votes[i] = numVotes;
    this.setState({votes, t: new Date()});
  }

  sendToReview = () => {
    this.props.setVotesToReview(this.state.votes);
    this.props.history.push('/review/' + this.props.idPoll);
  }

  render(){
    const {polls, classes, balances, idPoll} = this.props;
    const {originalVotes, votes} = this.state;
    const {fromWei} = web3.utils;

    if(!polls || !polls.length){
      return null;
    }

    const symbol = "SNT"; // TODO:

    const poll = polls[idPoll];

    const title = poll.content.title;
    const ballots = poll.content.ballots
    
    const balance = fromWei(balances[idPoll].tokenBalance, "ether");
    const cantVote = balance == 0 || !poll._canVote;
    const availableCredits = parseInt(balance, 10) - votes.reduce((prev, curr) => prev + curr * curr, 0);
    const disableVote = cantVote || availableCredits == parseInt(balance, 10);

    // Votes calculation
    const originalVotesQty = originalVotes.reduce((x,y) => x+y, 0);
    const buttonText = originalVotesQty != 0 && !arraysEqual(originalVotes, votes) ? 'Change Vote' : 'Vote';

    // Calculating votes availables
    const maxVotes = Math.floor(Math.sqrt(balance));

    const maxValuesForBallots = [];
    let votedSNT = 0;
    for(let i = 0; i < poll._numBallots; i++){
      if(votes[i] == undefined){
        votes[i] = 0;
      } else {
        votedSNT += votes[i]*votes[i];
      }
    }
    
    for(let i = 0; i < poll._numBallots; i++){
      maxValuesForBallots[i]  = Math.floor(Math.sqrt(balance - votedSNT + votes[i]*votes[i]));
    }

    return <Fragment>
    <div className="section">
        <Typography variant="headline">{title}</Typography>
      { votes.map((v, i) => {
          const item = ballots[i];
          return <BallotSlider key={i} title={item.title} subtitle={item.subtitle} symbol={symbol} classes={classes} votes={v} cantVote={cantVote} balance={balance} maxVotes={maxVotes} maxVotesAvailable={maxValuesForBallots[i]} updateVotes={this.updateVotes(i)} />

      })}
    </div>
    <div className="buttonNav">
      <Typography className="votingCredits"><span>{availableCredits}</span> Credits left</Typography>
      <Button disabled={disableVote} variant="text" onClick={this.sendToReview}>Review vote</Button>
    </div>
    </Fragment>
  }
}


class BallotSlider extends Component {

  state = {
    value: 0
  }

  componentWillReceiveProps(prevProps){
    if(this.props.votes != prevProps.votes)
      this.setState({value: prevProps.votes || 0})
  }

  handleChange = (event, value) => {
    if(value > this.props.maxVotesAvailable){
      value = this.props.maxVotesAvailable;
    }
    this.setState({value});
    this.props.updateVotes(value);
  };

  render(){
    const {maxVotes, maxVotesAvailable, classes, cantVote, balance, symbol, title, subtitle} = this.props;
    const {value} = this.state;
    const nextVote = value + 1;

    return <Card className="card">
              <CardContent>
                <Typography gutterBottom component="h2">{title}</Typography>
                <Typography component="p">{subtitle}</Typography>
                <Slider disabled={cantVote} classes={{ thumb: classes.thumb }} style={{ width: '95%' }} value={value} min={0} max={maxVotes} step={1}  onChange={this.handleChange} />
                {balance > 0 && !cantVote && <b>Your votes: {value} ({value * value} {symbol})</b>}
                { nextVote <= maxVotesAvailable && !cantVote ? <small>- Additional vote will cost {nextVote*nextVote - value*value} {symbol}</small> : (balance > 0 && !cantVote && <small>- Not enough balance available to buy additional votes</small>) }
              </CardContent>
          </Card>
  }
}


export default withRouter(withStyles(styles)(PollVoting));
