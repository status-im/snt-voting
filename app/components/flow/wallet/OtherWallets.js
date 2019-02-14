import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import React, { Component, Fragment } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import HelpDialog from '../HelpDialog';

// TODO: extract to utils
Date.prototype.DDMMYYYYatHHMM = function() {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var dd = pad(this.getDate(), 2);
  var hh = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);

  return dd + '/' + MM + '/' + yyyy + ' at ' + hh + ':' + mm + (this.getHours() > 12 ? 'pm' : 'am');
};

function getDate() {
  d = new Date();
  alert(d.YYYYMMDDHHMMSS());
}

function pad(number, length) {
  var str = String(number);
  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

class OtherWallets extends Component {
  state = {
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const props = this.props;

    let poll = null;

    let d = new Date();
    if (!props.noWeb3Provider) {
      if (!props.polls) {
        return null;
      }

      if (props.idPoll != 'poll-creation') {
        poll = props.polls.find(p => p.idPoll == props.idPoll);
        if (!poll) return null;
        d = new Date(poll.blockInfo.timestamp * 1000);
      }
    }

    return (
      <Fragment>
        <div className="section">
          <Typography variant="headline">Connect with a wallet with {this.props.symbol} in it.</Typography>
          {!props.noWeb3Provider && poll && (
            <Typography variant="body1" className="pollTime">
              Poll creation date: <b>{d.DDMMYYYYatHHMM()}</b>
            </Typography>
          )}
          <Typography variant="body1">Using your desktop computer</Typography>
          <Card className="card">
            <CardContent>
              <Typography gutterBottom component="h2">
                MetaMask
              </Typography>
              <Typography component="p">
                If you keep your {this.props.symbol} in MetaMask, please open vote.status.im in Google Chrome and make
                sure you are connected to the account where you keep your {this.props.symbol}.
              </Typography>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent>
              <Typography gutterBottom component="h2">
                Ledger or Trezor
              </Typography>
              <Typography component="p">
                If you keep your {this.props.symbol} in a Ledger or Trezor, please connect the device to MetaMask. Then
                open vote.status.im in Google Chrome with your hardware wallet’s account selected in metamask.
              </Typography>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent>
              <Typography gutterBottom component="h2">
                {this.props.symbol} on Exchanges
              </Typography>
              <Typography component="p">
                We are sorry. {this.props.symbol} held on exchanges don’t qualify for voting. To vote in the next poll,
                move your {this.props.symbol} to a wallet where you control the private keys.
              </Typography>
            </CardContent>
          </Card>
          <p className="helpLink">
            Need help? <a onClick={this.handleClickOpen}>Chat with us</a>
          </p>
        </div>
        <div className="buttonNav back">
          <Link to={props.idPoll !== undefined ? '/wallet/' + props.idPoll : '/'}>
            <Button variant="text">Back</Button>
          </Link>
        </div>
        <HelpDialog open={this.state.open} symbol={this.props.symbol} handleClose={this.handleClose} />
      </Fragment>
    );
  }
}

export default OtherWallets;
