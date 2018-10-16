import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

class LearnAboutBallots extends Component {
  state = {
    open: false
  };

  handleClickOpen = () => {
    this.setState({
    open: true,
    });
  };

  handleClose = value => {
    this.setState({ open: false });
  };

  render(){
    return (
    <div>
        <Typography variant="headline">What should Status Incubate invest in next?</Typography>
        <BallotDialog
          selectedValue={this.state.selectedValue}
          open={this.state.open}
          onClose={this.handleClose}
        />
        <Card>
        <CardContent>
            <Typography gutterBottom component="h2">Pixura</Typography>
            <Typography component="p">A protocol for digital asset ownership</Typography>
        </CardContent>
        <CardActions>
            <Button size="small" color="primary" onClick={this.handleClickOpen}>Learn more &gt;</Button>
        </CardActions>
        </Card>
        <Link to="/votingHelp"> <Button>How voting works</Button></Link>
    </div>
    );
  }
}

class BallotDialog extends Component {

  handleClose = () => {
    this.props.onClose(this.props.selectedValue);
  };
  
  handleListItemClick = value => {
    this.props.onClose(value);
  };
  
  render() {
    const { onClose, selectedValue, ...other } = this.props;
  
    return (
    <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
      <DialogTitle>Pixura</DialogTitle>
      <DialogContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose} color="primary" autoFocus>Ok</Button>
      </DialogActions>
    </Dialog>
    );
  }
}

export default LearnAboutBallots;