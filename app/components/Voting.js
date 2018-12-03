import React, { PureComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import AddPoll from './simple-voting/AddPoll';
import LinearProgress from '@material-ui/core/LinearProgress';
import { VotingContext } from '../context';
import { Route, Switch } from "react-router-dom";
import { withRouter } from 'react-router-dom'
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
import OtherPolls from './flow/OtherPolls';

import PollCreationCredits from './flow/create/PollCreationCredits';
import PollTitle from './flow/create/PollTitle';
import PollDescription from './flow/create/PollDescription';
import PollOptions from './flow/create/PollOptions';



class Voting extends PureComponent {
  state = { 
    addPoll: false,
    pollTokenBalances: [],
    votes: [],
    transaction: {},
    transactionHash: {},
    pollCr: {}
  };

  updatePollBalance = (pollId, tokenBalance, ethBalance, votes) => {
    const {pollTokenBalances} = this.state;
    pollTokenBalances[pollId] = { tokenBalance, ethBalance };
    this.setState({pollTokenBalances, votes});
  }

  setVotesToReview = (votes) => {
    this.setState({votes});
  }
  
  setTransactionHash = (idPoll, transactionHash) => {
    const stHash = this.state.transactionHash;
    stHash[idPoll] = transactionHash;
    
    this.setState({transactionHash: stHash[idPoll]});
  }

  setTransactionPromise = (idPoll, transaction) => {
    const sTrx = this.state.transaction;
    sTrx[idPoll] = transaction;
    this.setState({transaction: sTrx});
  }

  assignToPoll = (newData) => {
    const pollCr = Object.assign(this.state.pollCr, newData);
    this.setState({pollCr});
  }

  resetPoll = ()=>{
    this.setState({pollCr: {}});
  }


  render(){
    const { addPoll, pollTokenBalances, votes, transaction, transactionHash, start, end } = this.state;
    const togglePoll = () => { this.setState({ addPoll: !addPoll })};
1
    return (
      <VotingContext.Consumer>
        {({ getPolls, rawPolls, loading, symbol, replacePoll, loadPollContent, loadPollRange, loadMorePolls, start, resetPollCounter,  end }) =>
          <div>
            <CssBaseline />
            {loading && <LinearProgress />}
            <div id="votingDapp">
              <Switch>
                <Route exact path="/" render={props => <LandingPage polls={rawPolls} replacePoll={replacePoll} resetPollCounter={resetPollCounter}  />} />
                <Route path="/titleScreen/:id" render={props => <TitleScreen polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} />} />
                <Route path="/otherPolls/:pollType?" render={props => <OtherPolls polls={rawPolls} pollType={props.match.params.pollType} loadPollContent={loadPollContent} loadMorePolls={loadMorePolls} start={start} end={end} addHandlerKey={true} loadPollRange={loadPollRange} />} />
                <Route path="/learn/:id" render={props => <LearnAboutBallots polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} />} />
                <Route path="/votingHelp/:id" render={props => <HowVotingWorks idPoll={props.match.params.id} polls={rawPolls} updateBalances={this.updatePollBalance} loadPollContent={loadPollContent}  />} />
                <Route path="/votingCredits/:id" render={props => <VotingCredits polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} loadPollContent={loadPollContent} />} />
                <Route path="/wallet/:id" render={props => <ConnectYourWallet polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} />} />
                <Route path="/otherWallets/:id" render={props => <OtherWallets idPoll={props.match.params.id} polls={rawPolls} />}  />
                <Route path="/results/:id" render={props => <Results polls={rawPolls} idPoll={props.match.params.id} transaction={transaction} transactionHash={transactionHash}  loadPollContent={loadPollContent} />} />
                <Route path="/externalWallet/:id" render={props => <ExternalWallet  polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} />} />
                <Route path="/voting/:id/:back?" render={props => <PollVoting polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} originalVotes={votes} back={!!props.match.params.back} setVotesToReview={this.setVotesToReview} />} />
                <Route path="/review/:id" render={props => <ReviewVotes polls={rawPolls} idPoll={props.match.params.id} votes={votes} balances={pollTokenBalances} setTransactionPromise={this.setTransactionPromise} setTransactionHash={this.setTransactionHash} />} />
                <Route path="/admin" render={() => <AdminView />} />
                <Route path="/addPoll" render={() => <AddPoll togglePoll={togglePoll} getPolls={getPolls} />} />

                <Route path="/poll/create" render={() => <PollCreationCredits poll={this.state.pollCr} resetPoll={this.resetPoll} />} />
                <Route path="/poll/title" render={() => <PollTitle assignToPoll={this.assignToPoll} poll={this.state.pollCr} />} />
                <Route path="/poll/description" render={() => <PollDescription assignToPoll={this.assignToPoll} poll={this.state.pollCr} />} />
                <Route path="/poll/options" render={() => <PollOptions assignToPoll={this.assignToPoll} poll={this.state.pollCr} />} />

              </Switch>
            </div>
          </div>
        }
      </VotingContext.Consumer>
    )
  }
}

export default withRouter(Voting);
