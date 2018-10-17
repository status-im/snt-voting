import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'
import SNT from  'Embark/contracts/SNT';
import { withRouter } from 'react-router-dom'

class ConnectYourWallet extends Component {
  connectWallet = async () => {
    const {history, polls, updateBalances} = this.props;
    const tokenBalance = await SNT.methods.balanceOfAt(web3.eth.defaultAccount, polls[0]._startBlock).call();
    const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
    updateBalances(0, tokenBalance, ethBalance);
    history.push('/votingCredits');
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
