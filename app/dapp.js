import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import web3 from "Embark/web3"
import EmbarkJS from 'Embark/EmbarkJS';
import PollManager from 'Embark/contracts/PollManager';
import Voting from './components/Voting';
import SNT from  'Embark/contracts/SNT';
import { VotingContext } from './context';
import Web3Render from './components/standard/Web3Render';
import { getPolls, omitPolls } from './utils/polls';
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import OtherWallets from './components/flow/OtherWallets';
import Typography from '@material-ui/core/Typography'

import './dapp.css';

window.PollManager = PollManager;

const MAINNET = 1;
const TESTNET = 3;

// #38
setTimeout(() => {
  if(!(window.web3 || window.ethereum)){
    window.location.reload(true);
  }
}, 5000);


class App extends React.Component {

  constructor(props) {
    super(props);
  }
  state = { admin: false, pollOrder: 'NEWEST_ADDED', web3Provider: true, loading: true, symbol: "SNT", networkName: "" , rawPolls: []};

  componentDidMount(){
    EmbarkJS.onReady((err) => {
      if (err) this.setState({ web3Provider: false });
      else {
        if(!web3.eth.defaultAccount){
          web3.eth.defaultAccount = "0x0000000000000000000000000000000000000000";
        }

        this._getPolls();
       /* this._setAccounts();

        SNT.methods.symbol().call().then((symbol) => {
          this.setState({symbol});
        })*/

      }
      web3.eth.net.getId((err, netId) => {
        if(EmbarkJS.environment == 'testnet' && netId !== TESTNET){
          this.setState({web3Provider: false, networkName: "Ropsten"});
        } else if(EmbarkJS.environment == 'livenet' && netId !== MAINNET){
          this.setState({web3Provider: false, networkName: "Mainnet"});
        }
      })
    })
  }

  setAccount(_account){
    this.setState({account: _account});
  }

  _loadIPFSContent = async (polls) => {


    for(let i = 0; i < polls.length; i++){
      try {
        let ipfsContent = await EmbarkJS.Storage.get(web3.utils.toAscii(polls[i]._description));
        polls[i].content = JSON.parse(ipfsContent);
      } catch(err){
        console.log(err);
      }
    }

    let oPolls = {};
    for(let i = 0; i < polls.length; i++){
      oPolls[polls[i].idPoll] = polls[i];
    }
    this.setState({ rawPolls: oPolls, loading: false });
  }

  _getPolls = async () => {
    this.setState({ loading: true })
    const { nPolls, poll } = PollManager.methods;
    const polls = await nPolls().call({from: web3.eth.defaultAccount});
    if (polls) 
      getPolls(polls, poll)
        .then(omitPolls)
        .then(rawPolls => { 
          // this._loadIPFSContent(rawPolls);
          this.setState({rawPolls, loading: false});          
        });
    else 
      this.setState({ rawPolls: [], loading: false });
  }

  _setAccounts() {
    const { fromWei } = web3.utils;
    web3.eth.getAccounts(async (err, [address]) => {
      const balance = await SNT.methods.balanceOf(address).call();
      this.setState({ snt: { balance: fromWei(balance) }});
    })
  }

  updatePoll = async (idPoll) => {
    const { poll, nPolls } = PollManager.methods;
    const { rawPolls } = this.state;
    const npolls = await nPolls().call();
    // This check needs to be done because of a bug in web3
    if (npolls !== rawPolls.length) return this._getPolls();
    const newPolls = [...rawPolls];
    const updatedPoll = await poll(idPoll).call();
    newPolls[idPoll] = { ...updatedPoll };
    this.setState({ rawPolls: newPolls });
  }

  appendToPoll = (idPoll, data) => {
    const { rawPolls } = this.state;
    const newPolls = [...rawPolls];
    newPolls[idPoll] = { ...newPolls[idPoll], ...data }
    this.setState({ rawPolls: newPolls });
  }

  setPollOrder = pollOrder => { this.setState({ pollOrder }) }

  _renderStatus(title, available) {
    let className = available ? 'pull-right status-online' : 'pull-right status-offline';
    return <Fragment>
      {title}
      <span className={className}></span>
    </Fragment>;
  }


  replacePoll = (poll) => {
    let rawPolls = this.state.rawPolls;
    for(let i = 0; i < rawPolls.length; i++){
      if(rawPolls[i].idPoll == poll.idPoll){
        rawPolls[i] = poll;
        this.setState({rawPolls});
        break;
      }
    }
  }

  loadPollContent = async (poll) => {
    if(!poll) return;
    
    let ipfsContent = await EmbarkJS.Storage.get(web3.utils.toAscii(poll._description));
    poll.content = JSON.parse(ipfsContent);
    this.replacePoll(poll);
  }

  render(){
    let { web3Provider, networkName } = this.state;
    const { _getPolls, updatePoll, setPollOrder, appendToPoll, replacePoll, loadPollContent } = this;
    const votingContext = { getPolls: _getPolls, updatePoll, appendToPoll,  setPollOrder, replacePoll, loadPollContent, ...this.state };

    if(web3Provider){
      return <Router>
          <Web3Render ready={web3Provider}>
            <VotingContext.Provider value={votingContext}>
              <Voting />
            </VotingContext.Provider>
          </Web3Render>
        </Router>
    } else {
        if(networkName){
          return <div>
          <Typography variant="body1" style={{marginTop: "40vh", textAlign:"center"}}><img src="images/warning.svg" width="24" /><br /><br />Please connect to {networkName} to continue.</Typography>
        </div>
        } else {
          return <Router>
          <Fragment>
            <Switch>
              <Route exact path="/" render={() => {
                  return <Web3Render ready={web3Provider}>
                  <VotingContext.Provider value={votingContext}>
                    <Voting />
                  </VotingContext.Provider>
                  </Web3Render>
                }
              } />
              <Route path="/connectOtherWallet" render={() => <div id="votingDapp"><OtherWallets noWeb3Provider={true}  /></div>} />
            </Switch>
          </Fragment>
        </Router>
        }
    }
    
    
    
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
