import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DappToken from 'Embark/contracts/DappToken';
import PollManager from 'Embark/contracts/PollManager';
import utils from '../../../utils/utils';

class ExternalWallet extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.polls !== prevProps.polls && this.props.polls) {
      this.connectWallet();
    }
  }

  componentDidMount() {
    this.connectWallet();
  }

  connectWallet = async () => {
    const { history, polls, updateBalances, idPoll, decimals } = this.props;
    if (!polls) return;

    const poll = polls.find(p => p.idPoll == idPoll);
    if (!poll) return null;

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

    if (cont) {
      // TODO: extract this code to utils. It's repeated in ConnectYourWallt, ExternalWallet and HowVotingWorks
      const tknVotes = await PollManager.methods
        .getVote(idPoll, web3.eth.defaultAccount)
        .call({ from: web3.eth.defaultAccount });

      // TODO: use decimals
      const votes = tknVotes.map(x => Math.sqrt(parseInt(utils.fromTokenDecimals(x, decimals))));
      const tokenBalance = await DappToken.methods
        .balanceOfAt(web3.eth.defaultAccount, poll._startBlock)
        .call({ from: web3.eth.defaultAccount });
      const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
      updateBalances(idPoll, tokenBalance, ethBalance, votes);

      history.push('/votingCredits/' + idPoll);
    }
  };

  render() {
    return null;
  }
}

export default withRouter(ExternalWallet);
