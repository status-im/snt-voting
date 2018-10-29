import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PollManager from 'Embark/contracts/PollManager';
import { withRouter } from 'react-router-dom'

class ReviewVotes extends Component {

  state = {
    isSubmitting: false
  }

  vote = () => {
    this.setState({isSubmitting: true});

    const { vote, unvote } = PollManager.methods;
    const { votes, history, idPoll} = this.props;
    const { toWei, toBN } = web3.utils;
    
    const ballots = votes.map(el => {
      let num = toBN(el);
      num = num.mul(num);
      return toWei(num, "ether");
    });

    const balance4Voting = ballots.reduce((prev, curr) => prev.add(curr), toBN("0"));

    const toSend = balance4Voting == 0 ? unvote(idPoll) : vote(idPoll, ballots.map(x => x.toString()));

    toSend.estimateGas()
      .then(gasEstimated => {
        console.log("voting gas estimated: " + gasEstimated);
        const transaction = toSend.send({gas: gasEstimated + 100000});
        transaction.on('transactionHash', hash => {
          this.props.setTransactionHash(hash);
        })
        this.props.setTransactionPromise(transaction);
        history.push('/results/' + idPoll);
      });
  }

  componentDidMount(){
    const {polls, originalVotes, idPoll, history} = this.props;

    if(!polls || !polls.length){
      history.push('/');
      return;
    }
  }

  render(){
    const {polls, balances, votes, idPoll} = this.props;
    const {isSubmitting} = this.state;
    const {fromWei} = web3.utils;

    if(!polls || !polls.length || !balances[idPoll]){
      return null;
    }

    const poll = polls[polls.length - 1];
    const ballots = poll.content.ballots
    const balance = fromWei(balances[idPoll].tokenBalance, "ether");
    const availableCredits = parseInt(balance, 10) - votes.reduce((prev, curr) => prev + curr * curr, 0);
    
    return (polls ? <Fragment><div className="section">
        <Typography variant="headline">Review your vote</Typography>

        { ballots.map((item, i) => {
          return votes[i] > 0 ? <Card className="card review" key={i}>
            <CardContent>
              <Typography gutterBottom component="h2">{item.title}</Typography>
              <Typography component="p">{item.subtitle}</Typography>
              <div className="data">
                <div className="item">
                  <span>{votes[i]}</span>
                  votes
                </div>
                <div className="item noBorder">
                  <span>{votes[i] * votes[i]}</span>
                  credits
                </div>
              </div>
            </CardContent>
          </Card> : null;
        })}

        <Card className="card creditsAvailable">
          <CardContent>
              <Typography gutterBottom component="p">Unused voting power</Typography>
              <Typography gutterBottom component="h2">{availableCredits} credits</Typography>
              <Link to={"/voting/" + idPoll + "/back"}>Add votes</Link>
          </CardContent>
        </Card>
      </div>
      <div className="buttonNav">
        <Button variant="text" onClick={this.vote} disabled={isSubmitting}>Sign to confirm</Button>
    </div></Fragment> : null);
  }
}

export default withRouter(ReviewVotes);
