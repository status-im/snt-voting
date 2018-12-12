import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'react-router-dom';
import DappToken from  'Embark/contracts/DappToken';
import PollManager from  'Embark/contracts/PollManager';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


class HowVotingWorks extends Component {

  state = {
    open: false,
    tip: 0
  }


  handleClickOpen = tip => () => {
    this.setState({
      open: true,
      tip
    });
  };

  handleClose = value => {
    this.setState({ open: false });
  };


  componentDidUpdate(prevProps){
    if (this.props.polls !== prevProps.polls && this.props.polls) {
      // TODO: see how to extract this. Maybe a higher order component?
      const poll = this.props.polls.find(p => p.idPoll == this.props.idPoll);
      if(poll && !poll.content){
        this.props.loadPollContent(poll);
      }
    }
  }

  checkWeb3 = async () => {
    if(!window.web3){
      this.props.history.push("/wallet/" + this.props.idPoll);
      return;
    }

    const {history, polls, updateBalances, idPoll} = this.props;
    if(!polls) return;

    let cont = true;
    if (window.ethereum) {
      try {
          await ethereum.enable();
          web3.setProvider(ethereum);
          const accounts = await web3.eth.getAccounts();
          web3.eth.defaultAccount = accounts[0];
      } catch (error) {
        cont = false;
      }
    }

    if(cont){
      // TODO: extract this code to utils. It's repeated in ConnectYourWallt, ExternalWallet and HowVotingWorks
      const poll = polls.find(p => p.idPoll == idPoll);
      if(!poll) return null;
      
      // TODO: use decimals
      const tknVotes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call({from: web3.eth.defaultAccount});  
      const votes = tknVotes.map(x => Math.sqrt(parseInt(web3.utils.fromWei(x, "ether"))));            
      const tokenBalance = await DappToken.methods.balanceOfAt(web3.eth.defaultAccount, poll._startBlock).call({from: web3.eth.defaultAccount});
      const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
      updateBalances(idPoll, tokenBalance, ethBalance, votes);

      history.push('/votingCredits/' + idPoll);
    }
  }

  render() {
    const props = this.props;
    return <Fragment><div className="section">
    <Typography variant="headline">How voting works</Typography>
  <InfoDialog
  text={<Fragment>
    { this.state.tip == 1 && <p>When a vote is created, the Voting Dapp uses smart contracts to take a snapshot of all the wallets addresses which hold {this.props.symbol} and their {this.props.symbol} balances. These {this.props.symbol} balances are used to inform the number of voting credits a wallet address has. No {this.props.symbol} needs to be staked or committed, all that is required is to connect to the voting app with a wallet that had {this.props.symbol} in it before the "snapshot" was taken.</p> }
    { this.state.tip == 2 && <p>Voting credits are a representation of the {this.props.symbol} in the wallet address at the time the vote was created. When voting, the first ballot which is voted on will cost 1 voting credit. The second vote will cost an additional 3 voting credits to total 4 voting credits. Every additional vote will require its square in voting credits.</p> }
    { this.state.tip == 3 && <p>This voting process is called quadratic voting. It minimizes the effect that large token holders can have on the vote, measures the intensity of opinion and encourages a spread of voting amongst the ballots.</p> }
    </Fragment>}
  title={
    <Fragment>
    { this.state.tip == 1 && <span>Any wallet with {this.props.symbol} can vote</span> }
    { this.state.tip == 2 && <span>You don't spend your {this.props.symbol}!</span> }
    { this.state.tip == 3 && <span>Your vote counts</span> }
    </Fragment>
  }
  open={this.state.open}
  onClose={this.handleClose}
/>
  <Card className="card">
    <CardContent>
      <div className="left">
        <span><img src="images/wallet.svg" width="23" /></span>
      </div>
      <div className="right">
        <Typography gutterBottom component="h2">
          Any wallet with {this.props.symbol} can vote
        </Typography>
        <Typography component="p">
          When a poll is created a snapshot is taken of every wallet that holds {this.props.name} ({this.props.symbol}).
        </Typography>
      </div>
    </CardContent>
    <CardActions className="actionArea" style={{clear: "both", paddingLeft: "70px"}}>
      <Button size="small" color="primary" onClick={this.handleClickOpen(1)}>Learn more</Button>
    </CardActions>
  </Card>
  <Card className="card">
    <CardContent>
      <div className="left">
        <span><img src="images/happy-face.svg" width="23" /></span>
      </div>
      <div className="right">
        <Typography gutterBottom component="h2">
          You don't spend your {this.props.symbol}!
        </Typography>
        <Typography component="p">
          Your wallet gets one voting credit for every {this.props.symbol} it holds. To cast your vote, you sign a transaction, but you only spend a small amount of ETH for the transaction fee.
        </Typography>
      </div>
    </CardContent>
    <CardActions className="actionArea" style={{clear: "both", paddingLeft: "70px"}}>
      <Button size="small" color="primary" onClick={this.handleClickOpen(2)}>Learn more</Button>
    </CardActions>
  </Card>
  <Card className="card">
    <CardContent>
      <div className="left">
        <span><img src="images/envelope.svg" width="23" /></span>
      </div>
      <div className="right">
        <Typography gutterBottom component="h2">
        Your vote counts
        </Typography>
        <Typography component="p">
          Most votes when poll ends wins! Multiple votes cost more to prevent whales from controlling the vote
        </Typography>
      </div>
    </CardContent>
    <CardActions className="actionArea" style={{clear: "both", paddingLeft: "70px"}}>
      <Button size="small" color="primary" onClick={this.handleClickOpen(3)}>Learn more</Button>
    </CardActions>
  </Card>
</div>
<div className="buttonNav">
  <Button onClick={this.checkWeb3}>Next</Button>
</div>

</Fragment>;
  }
}



class InfoDialog extends Component {

  handleClose = () => {
    this.props.onClose(this.props.selectedValue);
  };
  
  handleListItemClick = value => {
    this.props.onClose(value);
  };
  
  render() {
    const { onClose, text, title, ...other } = this.props;
   
    return (
    <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" component="div">{text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose} color="primary" autoFocus>Ok</Button>
      </DialogActions>
    </Dialog>
    );
  }
}

export default withRouter(HowVotingWorks);