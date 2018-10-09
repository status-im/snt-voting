import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class LedgerDialog extends React.Component {
  state = {
    open: false,
  };

  handleClose = () => {
    this.setState({ open: false })
    this.props.onGasPrice(this.state.gasPrice)
  };

  handleChange = gasPrice => event => {
    this.setState({
      [gasPrice]: web3.utils.toWei(event.target.value,'Gwei')
    });
  };


  componentWillReceiveProps(nextProps) {
    if(this.props.open !== nextProps.open)
    {
      this.setState({ open: nextProps.open })
    }
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Gas Price (gwei)</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter gas price in gwei
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="gasprice"
              label="Gas Price"
              onChange={this.handleChange('gasPrice')}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}