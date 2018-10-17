import React, { PureComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import AppBar from './standard/AppBar';
import AddPoll from './simple-voting/AddPoll';
import Collapse from '@material-ui/core/Collapse';
import LinearProgress from '@material-ui/core/LinearProgress';
import { VotingContext } from '../context';
import { Route, Switch } from "react-router-dom";

import TitleScreen from './flow/TitleScreen';
import LearnAboutBallots from './flow/LearnAboutBallots';
import HowVotingWorks from './flow/HowVotingWorks';
import ConnectYourWallet from './flow/ConnectYourWallet';
import OtherWallets from './flow/OtherWallets';
import VotingCredits from './flow/VotingCredits';
import PollVoting from './flow/PollVoting';
import ReviewVotes from './flow/ReviewVotes';

class Voting extends PureComponent {
  state = { 
    addPoll: false,
    pollTokenBalances: [],
    votes: []
  };

  updatePollBalance = (pollId, tokenBalance, ethBalance) => {
    const {pollTokenBalances} = this.state;
    pollTokenBalances[pollId] = { tokenBalance, ethBalance };
    this.setState({pollTokenBalances});
  }

  setVotesToReview = (votes) => {
    this.setState({votes});
  }

  render(){
    const { addPoll, pollTokenBalances, votes } = this.state;
    const togglePoll = () => { this.setState({ addPoll: !addPoll })};

    return (
      <VotingContext.Consumer>
        {({ getPolls, rawPolls, loading, symbol }) =>
          <div>
            <CssBaseline />
            <AppBar togglePoll={togglePoll} symbol={symbol} />
            {loading && <LinearProgress />}
            <Collapse in={addPoll}>
              <AddPoll togglePoll={togglePoll} getPolls={getPolls} />
            </Collapse>
            <div id="votingDapp">
              <Switch>
                <Route exact path="/" render={() => <TitleScreen polls={rawPolls} />} />
                <Route path="/learn" render={() => <LearnAboutBallots polls={rawPolls} />} />
                <Route path="/votingHelp" render={HowVotingWorks} />
                <Route path="/wallet" render={() => <ConnectYourWallet polls={rawPolls} updateBalances={this.updatePollBalance} />} />
                <Route path="/otherWallets" render={OtherWallets} />
                <Route path="/votingCredits" render={() => <VotingCredits polls={rawPolls} balances={pollTokenBalances} />} />
                <Route path="/voting" render={() => <PollVoting polls={rawPolls} balances={pollTokenBalances} originalVotes={votes} setVotesToReview={this.setVotesToReview} />} />
                <Route path="/review" render={() => <ReviewVotes polls={rawPolls} votes={votes} />} />
              </Switch>
            </div>
          </div>
        }
      </VotingContext.Consumer>
    )
  }
}

export default Voting;
