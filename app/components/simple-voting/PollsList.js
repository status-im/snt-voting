import React, { Fragment, Component, PureComponent } from 'react';
import { toString } from 'lodash';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import PollManager from 'Embark/contracts/PollManager';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import web3 from "Embark/web3"
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { VotingContext } from '../../context';
import rlp from 'rlp';

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  thumb: {
    width: '24px',
    height: '24px'
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
};

const getIdeaFromStr = str => {
  const match = str.match(/\(([^)]+)\)/)
  if (match) return match[1].toLowerCase();
  return match;
}
const sortingFn = {
  MOST_VOTES: (a, b) => b._qvResults - a._qvResults,
  MOST_VOTERS: (a, b) => b._voters - a._voters,
  NEWEST_ADDED: (a, b) => b._startBlock - a._startBlock,
  ENDING_SOONEST: (a, b) => a._endBlock - b._endBlock
};
class Poll extends PureComponent {

  constructor(props){
    super(props);
    this.state = { 
      t: 0,
      value: props.votes, 
      originalVotes: {},  // TODO:  props.votes
      balance: 0, 
      isSubmitting: false, 
      open: false,
      votes: {
      }
     };
  }

  updateVotes = i => numVotes => {
    const votes = this.state.votes;
    votes[i] = numVotes;
    this.setState({votes, t: new Date()});
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleClick = (event) => {
    event.preventDefault();

    this.setState({isSubmitting: true});

    const { vote, poll, unvote } = PollManager.methods;
    const { updatePoll, idPoll } = this.props;
    const { votes } = this.state;
    const { toWei } = web3.utils;

    const ballots = Object.values(votes).map(el => el * el);
    const balance4Voting = ballots.reduce((prev, curr) => prev + curr, 0);
    const toSend = balance4Voting == 0 ? unvote(idPoll) : vote(idPoll, ballots);

    toSend.estimateGas()
          .then(gasEstimated => {
            console.log("voting gas estimated: " + gasEstimated);
            return toSend.send({gas: gasEstimated + 100000});
          })
          .then(res => {
            console.log('sucess:', res);
            this.setState({ isSubmitting: false, originalVotes: Object.assign({}, votes)});
            return updatePoll(idPoll);
          })
          .catch(res => {
            console.log('fail:', res, res.messsage);
            this.setState({ error: res.message })
          })
          .finally(() => {
            this.setState({isSubmitting: false});
          });
          
  }

  render(){
    const {
      _description,
      _voters,
      _qvResults,
      _results,
      _canVote,
      balance,
      classes,
      ideaSites,
      _numBallots,
    } = this.props;

    const { originalVotes, isSubmitting, error, votes } = this.state;
    const cantVote = balance == 0 || !_canVote;
    const disableVote = cantVote || isSubmitting;
    const originalVotesQty = Object.values(originalVotes).reduce((x,y) => x+y, 0);
    const votesQty = Object.values(votes).reduce((x,y) => x+y, 0);

    const buttonText = originalVotesQty != 0 && originalVotesQty != votesQty ? 'Change Vote' : 'Vote';

    // Extracting description
    const decodedDesc = rlp.decode(_description);
    const title = decodedDesc[0].toString();
    const ballots = decodedDesc[1];
    const idea = getIdeaFromStr(title);
    const ideaSite = ideaSites && ideaSites.filter(site => site.includes(idea));

    // Calculating votes availables
    const maxVotes = Math.floor(Math.sqrt(balance));
    const maxValuesForBallots = {};
    let votedSNT = 0;
    for(let i = 0; i < ballots.length; i++){
      if(votes[i] == undefined){
        votes[i] = 0;
        maxValuesForBallots[i] = 0;
      } else {
        votedSNT += votes[i]*votes[i];
      }
    }
    for(let i = 0; i < ballots.length; i++){
      maxValuesForBallots[i]  = Math.floor(Math.sqrt(balance - votedSNT + votes[i]*votes[i]));         // votes[i]   // Math.floor(Math.sqrt(balance - (votedSNT*votedSNT) + (votes[i]*votes[i])));
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="title">{title}</Typography>
          <Typography variant="subheading" color="textSecondary">
            <b>Total:</b> {_voters} voters. {_qvResults} votes ({(_results)} SNT) 
          </Typography>
          <Typography variant="subheading" color="textSecondary">
            <b>SNT available for voting:</b> {(balance - votedSNT).toFixed(2)} of {(parseFloat(balance).toFixed(2))} SNT
          </Typography>


          { _numBallots > 0 && 
            ballots.map((opt, i) => {
              return <div key={i}>
                      <Typography variant="display1">{opt.toString()}</Typography>
                      {!cantVote }
                      <BallotSlider classes={classes} votes={votes[0]} maxVotes={maxVotes} maxVotesAvailable={maxValuesForBallots[i]} updateVotes={this.updateVotes(i)} />
                    </div>
            }) 
          }

         
          {cantVote && <Typography variant="body2" color="error">
            {balance == 0 && <span>Voting disabled for proposals made when there was no SNT in the account</span>}
            {balance != 0 && !_canVote && <span>You can not vote on this poll</span>}
          </Typography>}


          {error && <Typography variant="body2" color="error">{error}</Typography>}

          {ideaSite && ideaSite.length > 0 && <Typography onClick={this.handleClickOpen} variant="subheading" color="primary">{ideaSite}</Typography>}
          {ideaSite && <Dialog
                         fullScreen
                         open={this.state.open}
                         onClose={this.handleClose}
                         TransitionComponent={Transition}
                       >
            <AppBar className={classes.appBar} onClick={this.handleClose}>
              <Toolbar>
                <IconButton color="inherit" aria-label="Close">
                  <CloseIcon />
                </IconButton>
                <Typography variant="title" color="inherit" className={classes.flex}>
                  close
                </Typography>
              </Toolbar>
            </AppBar>

            <div
              style={{ overflow: "auto", height: '100%', width: '100%', position: "fixed", top: 0, left: 0, zIndex: 1, overflowScrolling: "touch", WebkitOverflowScrolling: "touch" }}
            >
              <iframe
                className="contentIframe"
                frameBorder="0"
                src={ideaSite[0]}
                style={{ height: "100%", width: "100%" }}
                height="100%"
                width="100%"
              >
              </iframe>
            </div>
          </Dialog>}
        </CardContent>
        {!cantVote && <CardActions className={classes.card}>
        {isSubmitting ? <CircularProgress /> : <Button variant="contained" disabled={disableVote}  color="primary" onClick={this.handleClick}>{buttonText}</Button>}
      </CardActions>}
      </Card>
    )
  }
}


const PollsList = ({ classes }) => (
  <VotingContext.Consumer>
    {({ updatePoll, rawPolls, pollOrder, appendToPoll, ideaSites }) =>
      <Fragment>
        {rawPolls
          .sort(sortingFn[pollOrder])
          .map((poll, i) => <Poll key={poll.idPoll} classes={classes} appendToPoll={appendToPoll} updatePoll={updatePoll} ideaSites={ideaSites} {...poll} />)}
      </Fragment>
    }
  </VotingContext.Consumer>
)

class BallotSlider extends Component {

  constructor(props){
    super(props);
    this.state = {
      value: props.votes || 0
    }
  }

  handleChange = (event, value) => {
    if(value > this.props.maxVotesAvailable){
      value = this.props.maxVotesAvailable;
    }
    this.setState({value});
    this.props.updateVotes(value);
  };

  render(){
    const {maxVotes, maxVotesAvailable, classes} = this.props;
    const {value} = this.state;
    const nextVote = value + 1;

    return <Fragment>
              <Slider  classes={{ thumb: classes.thumb }} style={{ width: '95%' }} value={value} min={0} max={maxVotes} step={1}  onChange={this.handleChange} />
              <b>Votes: {value} ({value * value} SNT)</b> 
              { nextVote <= maxVotesAvailable ? <small>- Additional vote will cost {nextVote*nextVote - value*value} SNT</small> : <small>- Not enough balance available to buy additional votes</small> }
          </Fragment>
  }
}

export default withStyles(styles)(PollsList);
