import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import web3 from "Embark/web3"
import EmbarkJS from 'Embark/EmbarkJS';
import PollManager from 'Embark/contracts/PollManager';
import AdminView from './components/AdminView';
import Voting from './components/Voting';
import SNT from  'Embark/contracts/SNT';
import { VotingContext } from './context';
import Web3Render from './components/standard/Web3Render';
import fetchIdeas from './utils/fetchIdeas';
import { getPolls, omitPolls } from './utils/polls';
import { ledgerInstance } from './ledger';
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
      fetchIdeas().then(ideaSites => { this.setState({ ideaSites })});
    })
  }

  setAccount = (_account) => {
    this.setState({account: _account});
  }  
  
  setLedgerAccount = async (_account) => {
    const balance = await SNT.methods.balanceOf(_account).call()
    web3.eth.defaultAccount = _account
    this.setState({ 
      account: _account,
      snt: { balance: web3.utils.fromWei(balance) }
    })
  }

  _getPolls = async () => {
    this.setState({ loading: true })
    const { nPolls, poll } = PollManager.methods;
    const polls = await nPolls().call();
    if (polls) getPolls(polls, poll).then(omitPolls).then(rawPolls => { this.setState({ rawPolls, loading: false })});
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
    const { admin, web3Provider, loading } = this.state;
    const { _getPolls, updatePoll, setPollOrder, appendToPoll, setLedgerAccount, setAccount, _setAccounts } = this;
    const toggleAdmin = () => this.setState({ admin: true });
    const votingContext = { getPolls: _getPolls, toggleAdmin, updatePoll, appendToPoll, setPollOrder, setLedgerAccount, setAccount, setAccounts: _setAccounts,  ...this.state };
    return (
      <Web3Render ready={web3Provider}>
        <VotingContext.Provider value={votingContext}>
          <Fragment>
            {admin ?
             <AdminView setAccount={this.setAccount} /> :
             <Voting />}
          </Fragment>
        </VotingContext.Provider>
      </Web3Render>
    );
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
