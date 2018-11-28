import React, { PureComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import AppBar from './standard/AppBar';
import AddPoll from './simple-voting/AddPoll';
import Collapse from '@material-ui/core/Collapse';
import LinearProgress from '@material-ui/core/LinearProgress';
import { VotingContext } from '../context';
import { Route, Switch } from "react-router-dom";
import AdminView from '../components/AdminView';
import TitleScreen from './flow/TitleScreen';
import LearnAboutBallots from './flow/LearnAboutBallots';
import HowVotingWorks from './flow/HowVotingWorks';
import ConnectYourWallet from './flow/ConnectYourWallet';
import OtherWallets from './flow/OtherWallets';
import ExternalWallet from './flow/ExternalWallet';
import VotingCredits from './flow/VotingCredits';
import PollVoting from './flow/PollVoting';
import ReviewVotes from './flow/ReviewVotes';
import Results from './flow/Results';
import LandingPage from './flow/LandingPage';
import { withRouter } from 'react-router-dom'


class Voting extends PureComponent {
  state = { 
    addPoll: false,
    pollTokenBalances: [],
    votes: [],
    transaction: null,
    transactionHash: ''
  };

  updatePollBalance = (pollId, tokenBalance, ethBalance, votes) => {
    const {pollTokenBalances} = this.state;
    pollTokenBalances[pollId] = { tokenBalance, ethBalance };
    this.setState({pollTokenBalances, votes});
  }

  setVotesToReview = (votes) => {
    this.setState({votes});
  }
  
  setTransactionHash = (transactionHash) => {
    this.setState({transactionHash});
  }

  setTransactionPromise = (transaction) => {
    this.setState({transaction});
  }

  render(){
    const { addPoll, pollTokenBalances, votes, transaction, transactionHash } = this.state;
    const togglePoll = () => { this.setState({ addPoll: !addPoll })};

    return (
      <VotingContext.Consumer>
        {({ getPolls, rawPolls, loading, symbol, replacePoll, loadPollContent }) =>
          <div>
            <CssBaseline />
            {loading && <LinearProgress />}
            <div id="votingDapp">
              <Switch>
                <Route exact path="/" render={props => <LandingPage polls={rawPolls} replacePoll={replacePoll}  />} />
                <Route path="/titleScreen/:id" render={props => <TitleScreen polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} />} />
                <Route path="/learn/:id" render={props => <LearnAboutBallots polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} />} />
                <Route path="/votingHelp/:id" render={props => <HowVotingWorks idPoll={props.match.params.id} polls={rawPolls} updateBalances={this.updatePollBalance} loadPollContent={loadPollContent}  />} />
                <Route path="/votingCredits/:id" render={props => <VotingCredits polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} loadPollContent={loadPollContent} />} />
                <Route path="/wallet/:id" render={props => <ConnectYourWallet polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} />} />
                <Route path="/otherWallets/:id" render={props => <OtherWallets idPoll={props.match.params.id} polls={rawPolls} />}  />
                
                
                <Route path="/externalWallet/:id" render={props => <ExternalWallet  polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} />} />
                <Route path="/voting/:id/:back?" render={props => <PollVoting polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} originalVotes={votes} back={!!props.match.params.back} setVotesToReview={this.setVotesToReview} />} />
                <Route path="/review/:id" render={props => <ReviewVotes polls={rawPolls} idPoll={props.match.params.id} votes={votes} balances={pollTokenBalances} setTransactionPromise={this.setTransactionPromise} setTransactionHash={this.setTransactionHash} />} />
                <Route path="/results/:id" render={props => <Results polls={rawPolls} idPoll={props.match.params.id} transaction={transaction} transactionHash={transactionHash} />} />
                
                
                
                <Route path="/admin" render={() => <AdminView />} />
                <Route path="/addPoll" render={() => <AddPoll togglePoll={togglePoll} getPolls={getPolls} />} />
              </Switch>
            </div>
          </div>
        }
      </VotingContext.Consumer>
    )
  }
}

export default withRouter(Voting);
