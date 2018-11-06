import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'
import SNT from  'Embark/contracts/SNT';
import { withRouter } from 'react-router-dom'
import PollManager from 'Embark/contracts/PollManager';

class ConnectYourWallet extends Component {
  connectWallet = async () => {
    // TODO: extract this to utils, this code is repeated here, in other wallets and in How voting works

    const {history, polls, updateBalances, idPoll} = this.props;

    const poll = polls[idPoll];

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
      const tknVotes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call({from: web3.eth.defaultAccount});  
      const votes = tknVotes.map(x => Math.sqrt(parseInt(web3.utils.fromWei(x, "ether"))));

      if(web3.currentProvider.isStatus){
        const tokenBalance = await SNT.methods.balanceOfAt(web3.eth.defaultAccount, poll._startBlock).call({from: web3.eth.defaultAccount});
        const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
        updateBalances(idPoll, tokenBalance, ethBalance, votes);
        history.push('/votingCredits/' + idPoll);
      } else {
        window.location.href = "https://get.status.im/browse/" + location.href.replace(/^http(s?):\/\//, '');
      }
    }
  }

  render(){
    const {idPoll} = this.props;

    return <div className="section center">
    <Typography variant="headline">Connect your wallet</Typography>
    <Typography variant="body1">To start voting, connect to a wallet where you hold your SNT assets.</Typography>
    <div className="action">
      <Button color="primary" onClick={this.connectWallet} variant="contained">CONNECT USING STATUS</Button>
    </div>
    <div className="action">
      <Link to={"/otherWallets/" + idPoll}>
        <Button color="primary">CONNECT WITH ANOTHER WALLET</Button>
      </Link>
    </div>
  </div>;
  }
}

export default withRouter(ConnectYourWallet);
