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

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
  }
}

class PollVoting extends Component {

  state = {
    votes: [],
    originalVotes: [],
    voteOrder: [],
    t: new Date()
  }

  componentDidMount(){
    const {polls, originalVotes, idPoll, history} = this.props;

    if(!polls){
      history.push('/');
      return;
    }

    const poll = polls.find(p => p.idPoll == idPoll);
    if(!poll){
      history.push('/');
      return;
    }

    const votes = [];
    const voteOrder = [];
    if(originalVotes.length){
      for(let i = 0; i < poll._numBallots; i++){
        votes[i] = originalVotes[i];
        voteOrder.push(i);
      }
    }

    //shuffleArray(voteOrder);

    this.setState({
      voteOrder,
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

    const seconds = this.props.polls[this.props.idPoll]._endTime - (new Date()).getTime() / 1000;
    if(seconds <= 0){
      alert("Poll is expired");
      this.props.history.push('/');
    } else {
      this.props.setVotesToReview(this.state.votes);
      this.props.history.push('/review/' + this.props.idPoll);
    }
  }

  render(){
    const {polls, classes, balances, idPoll, back} = this.props;
    const {originalVotes, votes, voteOrder} = this.state;
    const {fromWei} = web3.utils;

    if(!polls){
      return null;
    }

    const symbol = this.props.symbol;

    const poll = polls.find(p => p.idPoll == idPoll);
    if(!poll) return null;
    
    const title = poll.content.title;
    const ballots = poll.content.ballots
    // TODO: use decimals
    const balance = fromWei(balances[idPoll].tokenBalance, "ether");
    const cantVote = balance == 0 || !poll._canVote;
    const availableCredits = parseInt(balance, 10) - votes.reduce((prev, curr) => prev + curr * curr, 0);
    const disableVote = cantVote || votes.reduce((x,y) => x+y, 0) == 0;

    // Votes calculation
    const originalVotesQty = originalVotes.reduce((x,y) => x+y, 0);

    // Calculating votes availables
    const maxVotes = Math.floor(Math.sqrt(balance));

    const maxValuesForBallots = [];
    let votedTokens = 0;
    for(let i = 0; i < poll._numBallots; i++){
      if(votes[i] == undefined){
        votes[i] = 0;
      } else {
        votedTokens += votes[i]*votes[i];
      }
    }
    
    for(let i = 0; i < poll._numBallots; i++){
      maxValuesForBallots[i]  = Math.floor(Math.sqrt(balance - votedTokens + votes[i]*votes[i]));
    }

    return <Fragment>
    <div className="section">
        <Typography variant="headline">{title}</Typography>
      { voteOrder.map((v, i) => {
          const item = ballots[v];
          return <BallotSlider key={i} title={item.title} subtitle={item.subtitle} symbol={symbol} classes={classes} votes={votes[v]} cantVote={cantVote} balance={balance} maxVotes={maxVotes} maxVotesAvailable={maxValuesForBallots[v]} updateVotes={this.updateVotes(v)} />

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
    value: 0,
    interval: null
  }

  componentDidMount(){
    this.setState({value: this.props.votes || 0});
  }

  /*
  handleChange = (event, value) => {
    if(value > this.props.maxVotesAvailable){
      value = this.props.maxVotesAvailable;
    }
    this.setState({value});
    this.props.updateVotes(value);
  };*/




  increaseVotes = (event) => {
    this.removeInterval();

    const updateVotes = () => {
      let value = this.state.value;
      if(value + 1 > this.props.maxVotesAvailable){
        value = this.props.maxVotesAvailable;
      } else {
        value++;
      }
      this.setState({value});
      this.props.updateVotes(value);
    };

    updateVotes();

    const interval = setInterval(updateVotes, 150);
    this.setState({interval});
  }

  reduceVotes = (event) => {
    this.removeInterval();

    const updateVotes = () => {
      let value = this.state.value;
      if(value - 1 < 0){
        value = 0;
      } else {  
        value--;
      }
      this.setState({value});
      this.props.updateVotes(value);

    };

    updateVotes();
    const interval = setInterval(updateVotes, 150);
    this.setState({interval});
  }

  removeInterval = () => {
    clearInterval(this.state.interval);
    this.setState({interval: null});

  }

  render(){
    const {maxVotes, maxVotesAvailable, classes, cantVote, balance, symbol, title, subtitle} = this.props;
    const {value} = this.state;
    const nextVote = value + 1;

    const toBN = web3.utils.toBN;
    let percentage = Math.round(value * 100 / maxVotes);
    percentage = percentage > 100 ? 100 : percentage;  

    return <Card className="card">
              <CardContent>
                <Typography gutterBottom component="h2">{title}</Typography>
                <Typography component="p">{subtitle}</Typography>
                <div className="customSlider">
                  <div className="nav1">
                    <button onMouseDown={this.reduceVotes} onMouseUp={this.removeInterval} onMouseLeave={this.removeInterval} disabled={percentage == 0 || cantVote || value == 0}><img src="images/slider-minus.svg" /></button>
                  </div>
                  <div className="nav2">
                    <button onMouseDown={this.increaseVotes} onMouseUp={this.removeInterval} onMouseLeave={this.removeInterval} disabled={percentage == 100 || cantVote || nextVote > maxVotesAvailable}><img src="images/slider-plus.svg" /></button>
                  </div>
                  <div className="content">
                    <div className="progress progress-large">
                      <span style={{width: percentage +'%'}}>
                        <Typography gutterBottom component="h2"><span>{value} votes <br /><small>{value*value} Credits</small></span></Typography>
                      </span>
                    </div>
                  </div>
                  <div className="clear"></div>
              </div>
            </CardContent>
          </Card>;
  }
}


// <Slider disabled={cantVote} classes={{ thumb: classes.thumb }} style={{ width: '95%' }} value={value} min={0} max={maxVotes} step={1}  onChange={this.handleChange} />
// {balance > 0 && !cantVote && <b>Your votes: {value} ({value * value} {symbol})</b>}
// { nextVote <= maxVotesAvailable && !cantVote ? <small>- Additional vote will cost {nextVote*nextVote - value*value} {symbol}</small> : (balance > 0 && !cantVote && <small>- Not enough balance available to buy additional votes</small>) }
              
            
              

export default withRouter(withStyles(styles)(PollVoting));
