import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'react-router-dom';
import SNT from  'Embark/contracts/SNT';
import PollManager from  'Embark/contracts/PollManager';


class HowVotingWorks extends Component {

  checkWeb3 = async () => {
    if(!window.web3){
      this.props.history.push("/wallet/" + this.props.idPoll);
      return;
    }

    const {history, polls, updateBalances, idPoll} = this.props;
    if(!polls || !polls.length) return;

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
      const poll = polls[polls.length - 1];
      const tknVotes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call();  
      const votes = tknVotes.map(x => Math.sqrt(parseInt(web3.utils.fromWei(x, "ether"))));            
      const tokenBalance = await SNT.methods.balanceOfAt(web3.eth.defaultAccount, poll._startBlock).call();
      const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
      updateBalances(idPoll, tokenBalance, ethBalance, votes);

      history.push('/votingCredits/' + idPoll);
    }
  }

  render() {
    const props = this.props;
    return <Fragment><div className="section">
  <Typography variant="headline">How voting works</Typography>
  <Card className="card">
    <CardContent>
      <div className="left">
        <span><img src="images/wallet.svg" width="23" /></span>
      </div>
      <div className="right">
        <Typography gutterBottom component="h2">
          Any wallet with SNT can vote
        </Typography>
        <Typography component="p">
          When a poll is created a snapshot is taken of every wallet that holds Status Network Tokens (SNT).
        </Typography>
      </div>
    </CardContent>
  </Card>
  <Card className="card">
    <CardContent>
      <div className="left">
        <span><img src="images/happy-face.svg" width="23" /></span>
      </div>
      <div className="right">
        <Typography gutterBottom component="h2">
          You don't spend your SNT!
        </Typography>
        <Typography component="p">
          Your wallet gets one voting credit for every SNT it holds. To cast your vote, you sign a transaction, but you only spend a small amount of ETH for the transaction fee.
        </Typography>
      </div>
    </CardContent>
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
  </Card>
</div>
<div className="buttonNav">
  <Button onClick={this.checkWeb3}>Next</Button>
</div>

</Fragment>;
  }
}

export default withRouter(HowVotingWorks);