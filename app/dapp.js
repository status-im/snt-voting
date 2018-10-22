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
import { HashRouter as Router, Route, Link } from "react-router-dom";



window['Token'] = SNT;

import './dapp.css';

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
        this._getPolls();
        this._setAccounts();

        SNT.methods.symbol().call().then((symbol) => {
          this.setState({symbol});
        })

      }
      web3.eth.net.getId((err, netId) => {
        // TODO: check the environment here
        if (netId !== MAINNET && netId !== TESTNET && netId < 5) this.setState({ web3Provider: false})
      })

      // fetchIdeas().then(ideaSites => { this.setState({ ideaSites })});
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
    const polls = await nPolls().call();
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
    const { admin, web3Provider } = this.state;
    const { _getPolls, updatePoll, setPollOrder, appendToPoll } = this;
    const toggleAdmin = () => this.setState({ admin: true });
    const votingContext = { getPolls: _getPolls, toggleAdmin, updatePoll, appendToPoll, setPollOrder, ...this.state };
    return (
      <Web3Render ready={web3Provider}>
        <Router>
          <VotingContext.Provider value={votingContext}>
            <Fragment>
              <Route path="/" component={Voting}/>
            </Fragment>
          </VotingContext.Provider>
        </Router>
      </Web3Render>
    );
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
