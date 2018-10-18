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
    const { polls, votes, history} = this.props;
    const { toWei } = web3.utils;
    
    const idPoll = 0; // TODO: 

    const ballots = votes.map(el => parseInt(toWei((el * el).toString(), "ether")));
    const balance4Voting = ballots.reduce((prev, curr) => prev + curr, 0);
    const toSend = balance4Voting == 0 ? unvote(idPoll) : vote(idPoll, ballots);

    toSend.estimateGas()
      .then(gasEstimated => {
        console.log("voting gas estimated: " + gasEstimated);
        const transaction = toSend.send({gas: gasEstimated + 100000});
        this.props.setTransactionPromise(transaction);
        history.push('/results');
      });
  }

  render(){
    const {polls, balances, votes} = this.props;
    const {isSubmitting} = this.state;
    const {fromWei} = web3.utils;

    if(!polls || !polls.length){
      return null;
    }

    const poll = polls[0];
    const ballots = poll.content.ballots
    const balance = fromWei(balances[0].tokenBalance, "ether");
    const availableCredits = parseInt(balance, 10) - votes.reduce((prev, curr) => prev + curr * curr, 0);
    
    return (polls ? <Fragment><div className="section">
        <Typography variant="headline">Review your vote</Typography>

        { ballots.map((item, i) => {
          return <Card className="card" key={i}>
            <CardContent>
              <Typography gutterBottom component="h2">{item.title}</Typography>
              <Typography component="p">{item.subtitle}</Typography>
              <Typography component="p">{votes[i]} votes</Typography>
              <Typography component="p">{votes[i] * votes[i]} credits</Typography>
            </CardContent>
          </Card>
        })}

        <Card className="card creditsAvailable">
          <CardContent>
              <Typography gutterBottom component="p">Unused voting power</Typography>
              <Typography gutterBottom component="h2">{availableCredits} credits</Typography>
              <Link to="/voting"><Button variant="text">Add votes</Button></Link>
          </CardContent>
        </Card>
      </div>
      <div className="buttonNav">

        <Button variant="text" onClick={this.vote} disabled={isSubmitting}>Sign to confirm</Button>


    </div></Fragment> : null);
  }
}

export default withRouter(ReviewVotes);
