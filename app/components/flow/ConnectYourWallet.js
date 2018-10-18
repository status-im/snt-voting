import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'
import SNT from  'Embark/contracts/SNT';
import { withRouter } from 'react-router-dom'
import PollManager from 'Embark/contracts/PollManager';

class ConnectYourWallet extends Component {
  connectWallet = async () => {
    const {history, polls, updateBalances} = this.props;


    // TODO:
    //web3.currentProvider.isStatus = true;

    const poll = polls[0];
    const idPoll = 0;

    const tknVotes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call();  
    const votes = tknVotes.map(x => Math.sqrt(parseInt(web3.utils.fromWei(x, "ether"))));

    if(web3.currentProvider.isStatus){
      const tokenBalance = await SNT.methods.balanceOfAt(web3.eth.defaultAccount, poll._startBlock).call();
      const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
      updateBalances(0, tokenBalance, ethBalance, votes);
      history.push('/votingCredits');
    } else {
      window.location.href = "https://get.status.im/browse/" + location.href.replace(/^http(s?):\/\//, '');
    }
  }

  render(){
    return <div className="section center">
    <Typography variant="headline">Connect your wallet</Typography>
    <Typography variant="body1">To start voting, connect to a wallet where you hold your SNT assets.</Typography>
    <div className="action">
      <Button color="primary" onClick={this.connectWallet} variant="contained">CONNECT USING STATUS</Button>
    </div>
    <div className="action">
      <Link to="/otherWallets">
        <Button color="primary">CONNECT WITH ANOTHER WALLET</Button>
      </Link>
    </div>
  </div>;
  }
}

export default withRouter(ConnectYourWallet);
