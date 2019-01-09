import React, { PureComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import LinearProgress from '@material-ui/core/LinearProgress';
import { VotingContext } from '../context';
import { Route, Switch, withRouter } from "react-router-dom";
import AdminView from '../components/AdminView';
import TitleScreen from './flow/TitleScreen';
import LearnAboutBallots from './flow/LearnAboutBallots';
import HowVotingWorks from './flow/HowVotingWorks';
import ConnectYourWallet from './flow/wallet/ConnectYourWallet';
import OtherWallets from './flow/wallet/OtherWallets.js';
import ExternalWallet from './flow/wallet/ExternalWallet';
import VotingCredits from './flow/VotingCredits';
import PollVoting from './flow/PollVoting';
import ReviewVotes from './flow/ReviewVotes';
import Results from './flow/Results';
import LandingPage from './flow/LandingPage';
import OtherPolls from './flow/OtherPolls';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import PollCreationCredits from './flow/create/PollCreationCredits';
import PollTitle from './flow/create/PollTitle';
import PollDescription from './flow/create/PollDescription';
import PollOptions from './flow/create/PollOptions';
import PollSchedule from './flow/create/PollSchedule';
import PollReview from './flow/create/PollReview';
import PollCreationResults from './flow/create/PollCreationResults';



class Voting extends PureComponent {
  state = { 
    addPoll: false,
    pollTokenBalances: [],
    votes: [],
    transaction: {},
    transactionHash: {},
    pollTransaction: null,
    pollTransactionHash: null,
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
    
    this.setState({transactionHash: stHash});
  }

  setTransactionPromise = (idPoll, transaction) => {
    const sTrx = this.state.transaction;
    sTrx[idPoll] = transaction;
    this.setState({transaction: sTrx});
  }

  setPollTransactionHash = (transactionHash) => {
    this.setState({pollTransactionHash: transactionHash});
  }

  setPollTransactionPromise = (transaction) => {
    this.setState({pollTransaction: transaction});
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

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <VotingContext.Consumer>
        {({ getPolls, rawPolls, loading, symbol, decimals, name, replacePoll, loadPollContent, loadPollRange, loadMorePolls, start, resetPollCounter,  end }) =>
          <div>
            <CssBaseline />
            {loading && <LinearProgress />}
            <div id="votingDapp">
              <Switch>
                <Route exact path="/" render={props => <LandingPage polls={rawPolls} replacePoll={replacePoll} resetPollCounter={resetPollCounter} symbol={symbol} decimals={decimals}  />} />
                <Route path="/titleScreen/:id" render={props => <TitleScreen polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} symbol={symbol} decimals={decimals} />} />
                <Route path="/otherPolls/:pollType?" render={props => <OtherPolls polls={rawPolls} pollType={props.match.params.pollType} loadPollContent={loadPollContent} loadMorePolls={loadMorePolls} start={start} end={end} addHandlerKey={true} loadPollRange={loadPollRange} symbol={symbol} decimals={decimals} />} />
                <Route path="/learn/:id" render={props => <LearnAboutBallots polls={rawPolls} idPoll={props.match.params.id} loadPollContent={loadPollContent} symbol={symbol} decimals={decimals} />} />
                <Route path="/votingHelp/:id" render={props => <HowVotingWorks idPoll={props.match.params.id} polls={rawPolls} updateBalances={this.updatePollBalance} loadPollContent={loadPollContent} symbol={symbol} decimals={decimals} name={name}  />} />
                <Route path="/votingCredits/:id" render={props => <VotingCredits polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} loadPollContent={loadPollContent} symbol={symbol} decimals={decimals} />} />
                <Route path="/wallet/:id" render={props => <ConnectYourWallet polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} symbol={symbol} decimals={decimals} />} />
                <Route path="/otherWallets/:id" render={props => <OtherWallets idPoll={props.match.params.id} polls={rawPolls} symbol={symbol} decimals={decimals} />}  />
                <Route path="/results/:id" render={props => <Results polls={rawPolls} idPoll={props.match.params.id} transaction={transaction} transactionHash={transactionHash}  loadPollContent={loadPollContent} symbol={symbol} decimals={decimals} />} />
                <Route path="/externalWallet/:id" render={props => <ExternalWallet  polls={rawPolls} idPoll={props.match.params.id} updateBalances={this.updatePollBalance} symbol={symbol} decimals={decimals} />} />
                <Route path="/voting/:id/:back?" render={props => <PollVoting polls={rawPolls} idPoll={props.match.params.id} balances={pollTokenBalances} originalVotes={votes} back={!!props.match.params.back} setVotesToReview={this.setVotesToReview} symbol={symbol} decimals={decimals} />} />
                <Route path="/review/:id" render={props => <ReviewVotes polls={rawPolls} idPoll={props.match.params.id} votes={votes} balances={pollTokenBalances} setTransactionPromise={this.setTransactionPromise} setTransactionHash={this.setTransactionHash} symbol={symbol} decimals={decimals} />} />
                <Route path="/admin" render={() => <AdminView symbol={symbol} decimals={decimals} />} />

                <Route path="/poll/create" render={() => <PollCreationCredits poll={this.state.pollCr} resetPoll={this.resetPoll} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/title" render={() => <PollTitle assignToPoll={this.assignToPoll} poll={this.state.pollCr} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/description" render={() => <PollDescription assignToPoll={this.assignToPoll} poll={this.state.pollCr} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/options" render={() => <PollOptions assignToPoll={this.assignToPoll} poll={this.state.pollCr} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/schedule" render={() => <PollSchedule assignToPoll={this.assignToPoll} poll={this.state.pollCr} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/review" render={() => <PollReview poll={this.state.pollCr} setPollTransactionHash={this.setPollTransactionHash} setPollTransactionPromise={this.setPollTransactionPromise} symbol={symbol} decimals={decimals} />} />
                <Route path="/poll/results" render={() => <PollCreationResults loadPollContent={loadPollContent} getPolls={getPolls} resetPoll={this.resetPoll} poll={this.state.pollCr} pollTransactionHash={this.state.pollTransactionHash} pollTransaction={this.state.pollTransaction} symbol={symbol} decimals={decimals} />} />
              </Switch>
            </div>
          </div>
        }
      </VotingContext.Consumer>
      </MuiPickersUtilsProvider>

    )
  }
}

export default withRouter(Voting);
