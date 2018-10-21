import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'
import SNT from  'Embark/contracts/SNT';
import PollManager from  'Embark/contracts/PollManager';

class ExternalWallet extends Component {
    
    componentDidUpdate(prevProps){
        if (this.props.polls !== prevProps.polls && this.props.polls && this.props.polls.length) {
            this.connectWallet();
        }
    }

    componentDidMount(){
        this.connectWallet();
    }

    connectWallet = async () => {
        const {history, polls, updateBalances, idPoll} = this.props;
        if(!polls || !polls.length) return;

        const poll = polls[idPoll];
        const tknVotes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call();  
        const votes = tknVotes.map(x => Math.sqrt(parseInt(web3.utils.fromWei(x, "ether"))));            
        const tokenBalance = await SNT.methods.balanceOfAt(web3.eth.defaultAccount, poll._startBlock).call();
        const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);
        updateBalances(idPoll, tokenBalance, ethBalance, votes);

        history.push('/votingCredits/' + idPoll);
    };

    render(){
        return null;
    }
}

export default withRouter(ExternalWallet);