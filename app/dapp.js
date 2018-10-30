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

import './dapp.css';

window.PollManager = PollManager;

const MAINNET = 1;
const TESTNET = 3;

class App extends React.Component {

  constructor(props) {
    super(props);
  }
  state = { admin: false, pollOrder: 'NEWEST_ADDED', web3Provider: true, loading: true, symbol: "SNT" };

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
        // TODO: check the environment here
        if (netId !== MAINNET && netId !== TESTNET && netId < 5) this.setState({ web3Provider: false})
      })
    })
  }

  setAccount(_account){
    this.setState({account: _account});
  }

  _loadIPFSContent = async (polls) => {
    let promises = polls.map((item,i) => EmbarkJS.Storage.get(web3.utils.toAscii(item._description)));
    let ipfsContent = await Promise.all(promises);
    
    for(let i = 0; i < polls.length; i++){
      polls[i].content = JSON.parse(ipfsContent[i]);
    }

    this.setState({ rawPolls: polls, loading: false });
  }

  _getPolls = async () => {
    this.setState({ loading: true })
    const { nPolls, poll } = PollManager.methods;
    const polls = await nPolls().call({from: web3.eth.defaultAccount});
    if (polls) getPolls(polls, poll).then(omitPolls).then(rawPolls => { 
      this._loadIPFSContent(rawPolls);
    });
    else this.setState({ rawPolls: [], loading: false });
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

  render(){
    let { web3Provider } = this.state;
    const { _getPolls, updatePoll, setPollOrder, appendToPoll } = this;
    const votingContext = { getPolls: _getPolls, updatePoll, appendToPoll, setPollOrder, ...this.state };

    if(web3Provider){
      return <Router>
          <Web3Render ready={web3Provider}>
            <VotingContext.Provider value={votingContext}>
              <Voting />
            </VotingContext.Provider>
          </Web3Render>
        </Router>
    } else {
      return (
        <Router>
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
    );
    }
    
    
    
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
