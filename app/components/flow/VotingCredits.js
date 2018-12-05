import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withRouter } from 'react-router-dom'
import HelpDialog from './HelpDialog';


Date.prototype.DDMMYYYY = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1,2);
  var dd = pad(this.getDate(), 2);

  return dd + '/' + MM + '/' + yyyy ;
};

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
}

class VotingCredits extends Component {

  state = {
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  componentDidMount(){
    const {polls, balances, history} = this.props;
    if(!polls || !balances || !balances.length){
      history.push('/');
    }
  }

  componentDidUpdate(prevProps){
    if (this.props.polls !== prevProps.polls && this.props.polls) {
      // TODO: see how to extract this. Maybe a higher order component?
      const poll = this.props.polls.find(p => p.idPoll == this.props.idPoll);
      if(poll && !poll.content){
        this.props.loadPollContent(poll);
      }
    }
  }

  redirectToConnect = () => {
    this.props.history.push('/wallet/' + this.props.idPoll);
  }

  render(){
    const {polls, balances, idPoll} = this.props;

    if(!polls || !balances) return null;

    const poll = polls.find(p => p.idPoll == idPoll);
    if(!poll || !poll.content) return null;
    
    let title = poll.content.title;
    let description = poll.content.description;
    let ethBalance = web3.utils.fromWei(balances[idPoll].ethBalance, "ether");
    let tokenBalance = Math.floor(web3.utils.fromWei(balances[idPoll].tokenBalance, "ether"));
  

   const d = new Date(poll.blockInfo.timestamp * 1000);


    return (polls ? <Fragment><div className="section">
        <Typography variant="headline">{title}</Typography>
        <Typography variant="body1" component="div" dangerouslySetInnerHTML={{__html: description}}></Typography>
      <Card className="card credits" onClick={this.redirectToConnect}>
        <CardContent>
            <Typography component="div" onClick={this.redirectToConnect}>
              <span className="title">Voting Credits</span>
              <span className="value">{tokenBalance}</span>
            </Typography>
            { tokenBalance >= 1 &&
            <Typography component="p" className="text" onClick={this.redirectToConnect}>
            You get one credit for each {this.props.symbol} held in your wallet <b>at the time of poll was created ({d.DDMMYYYY()})</b>. They are usable only in this poll.
            </Typography> }
            { tokenBalance < 1 &&
              <div className="warning">
                <Typography component="h2" onClick={this.redirectToConnect}>
                  No {this.props.symbol} in your wallet
                </Typography>
                <Typography component="p" onClick={this.redirectToConnect}>
                  To vote, you need to connect with a wallet that holds {this.props.symbol} tokens <b>when the poll was created ({d.DDMMYYYY()})</b>.
                </Typography>
              </div>
            }
          </CardContent>
      </Card>
      { ethBalance == 0 && <Card className="card credits">
        <CardContent>
            <Typography component="div" onClick={this.redirectToConnect}>
              <span className="title">ETH</span>
              <span className="value">{ethBalance}</span>
            </Typography>
            <div className="warning">
              <Typography component="h2" onClick={this.redirectToConnect}>
                Not enough ETH in your wallet
              </Typography>
              <Typography component="p" onClick={this.redirectToConnect}>
                You will sign a transaction to confirm your vote. No tokens are sent, but you need ETH to pay for gas (Ethereum network fee).
              </Typography>
            </div>
          </CardContent>
      </Card> }
    </div>
    <div className={(ethBalance == 0 || tokenBalance == 0) ? 'buttonNav back' : 'buttonNav'}>
      { (ethBalance == 0 || tokenBalance == 0) && <Link to={"/wallet/" + idPoll}><Button variant="text">Back</Button></Link> }
      { (ethBalance > 0 && tokenBalance > 0) && <Link to={"/voting/" + idPoll}><Button variant="text">Vote</Button></Link> }
    </div>
    <p className="helpLink">Need help? <a onClick={this.handleClickOpen}>Chat with us</a></p>
    <HelpDialog open={this.state.open} symbol={this.props.symbol} handleClose={this.handleClose} />
    </Fragment> : null);
  }
}

export default withRouter(VotingCredits);
