import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
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
    open: false,
    dialogTitle: '',
    dialogText: ''
  };

  handleClickOpen = (dialogTitle, dialogText) => {
    this.setState({
      open: true,
      dialogTitle,
      dialogText
    });
  };

  handleClose = value => {
    this.setState({ open: false });
  };


  componentDidUpdate(prevProps){
    if (this.props.polls !== prevProps.polls && this.props.polls) {
      // TODO: see how to extract this. Maybe a higher order component?
      const poll = this.props.polls.find(p => p.idPoll == this.props.idPoll);
      if(poll && !poll.content){
        this.props.loadPollContent(poll);
      }
    }
  }

  render(){
    const {polls, idPoll} = this.props;

    if(!polls) return null;
    
    const poll = polls.find(p => p.idPoll == idPoll);
    if(!poll || !poll.content) return null;

    const title = poll.content.title;
    const ballots = poll.content.ballots;
  
    return (<Fragment>
    <div className="section">
        <Typography variant="headline">{title}</Typography>
        <BallotDialog
          title={this.state.dialogTitle}
          text={this.state.dialogText}
          open={this.state.open}
          onClose={this.handleClose}
        />
        {
          ballots.map((item, i) => {
            return <Card key={i} className="card">
              <CardContent className="ballotData">
                  <Typography gutterBottom component="h2">{item.title}</Typography>
                  <Typography component="p">{item.subtitle}</Typography>
              </CardContent>
              <CardActions className="actionArea">
                  <Button size="small" color="primary" onClick={() => this.handleClickOpen(item.title, item.content)}>Learn more</Button>
              </CardActions>
            </Card>
          })
        }
    </div>
    <div className="buttonNav">
      <Link to={"/votingHelp/" + idPoll}><Button className="nextAction">How voting works</Button></Link>
    </div>
    </Fragment>
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
    const { onClose, title, text, polls, ...other } = this.props;
   
    return (
    <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" component="div">{text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose} color="primary" autoFocus>Ok</Button>
      </DialogActions>
    </Dialog>
    );
  }
}

export default LearnAboutBallots;