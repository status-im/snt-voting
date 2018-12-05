import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withRouter } from 'react-router-dom'
import HelpDialog from '../HelpDialog';
import DappToken from  'Embark/contracts/DappToken';

Date.prototype.DDMMYYYY = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1,2);
  var dd = pad(this.getDate(), 2);

  return dd + '/' + MM + '/' + yyyy ;
};

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
}

class PollCreationCredits extends Component {

  state = {
    open: false,
    tokenBalance: '-',
    ethBalance: '1'
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };



  componentDidMount(){
    const {history} = this.props;

    if(this.props.poll.title !== undefined){
      this.props.resetPoll();
      history.push('/');
      return;
    }

    EmbarkJS.onReady(async () => {
      const tokenBalance = await DappToken.methods.balanceOf(web3.eth.defaultAccount).call({from: web3.eth.defaultAccount});
      const ethBalance = await web3.eth.getBalance(web3.eth.defaultAccount);

      this.setState({tokenBalance, ethBalance});

      if(web3.utils.fromWei(ethBalance.toString(), "ether") > 0 &&
      // TODO: use decimals
        Math.floor(web3.utils.fromWei(tokenBalance.toString(), "ether")) >= 1
      ){
        history.push('/poll/title');
        return;
      }

    })
  }

  render(){
    let ethBalance = web3.utils.fromWei(this.state.ethBalance, "ether");
    // TODO: use decimals
    let tokenBalance = this.state.tokenBalance != "-" ? Math.floor(web3.utils.fromWei(this.state.tokenBalance, "ether")) : "-";

    return <Fragment><div className="section">
        <Typography variant="headline">Create a Poll</Typography>
      <Card className="card credits">
        <CardContent>
            <Typography component="div">
              <span className="title">Voting Credits</span>
              <span className="value">{tokenBalance}</span>
            </Typography>
            { tokenBalance == 0 &&
              <div className="warning">
                <Typography component="h2">
                  No {this.props.symbol} in your wallet
                </Typography>
                <Typography component="p">
                To create a poll, you need to connect with a wallet that holds {this.props.symbol} tokens.
                </Typography>
              </div>
            }
          </CardContent>
      </Card>
      { ethBalance == 0 && <Card className="card credits">
        <CardContent>
            <Typography component="div">
              <span className="title">ETH</span>
              <span className="value">{ethBalance}</span>
            </Typography>
            <div className="warning">
              <Typography component="h2">
                Not enough ETH in your wallet
              </Typography>
              <Typography component="p">
              You will sign a transaction to publish the poll. You need ETH to pay for gas (Ethereum network fee).
              </Typography>
            </div>
          </CardContent>
      </Card> }
    </div>
    <div className={(ethBalance == 0 || tokenBalance == 0) ? 'buttonNav back' : 'buttonNav'}>
      { (ethBalance == 0 || tokenBalance == 0) && <Link to={"/"}><Button variant="text">Back</Button></Link> }
    </div>
    <p className="helpLink">Need help? <a onClick={this.handleClickOpen}>Chat with us</a></p>
    </Fragment>;
  }
}

export default withRouter(PollCreationCredits);
