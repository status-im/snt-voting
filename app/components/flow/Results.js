import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'
import PollManager from 'Embark/contracts/PollManager';

class Results extends Component {

  state = {
    isError: false,
    poll: null
  }

  constructor(props){
    super(props);

    if(props.polls && props.polls.length)
      this.state.poll = props.polls[props.idPoll]; 
  }

  updatePoll(){
    const idPoll = this.props.idPoll; 
    PollManager.methods.poll(idPoll).call().then(poll => {
      this.setState({poll});
    })
  }

  componentDidMount(){
    const {transaction, idPoll} = this.props;

    EmbarkJS.onReady(() => {
      this.updatePoll();

      if(transaction){
        transaction.then(receipt => {
          this.updatePoll();
        })
        .catch(err => {
          this.setState({isError: true});
        });
      }
    });

  }

  render(){
    const {polls, idPoll} = this.props;
    let {isError, poll} = this.state;

    if(!poll || !polls){
      return null;
    }

    const title = polls[idPoll].content.title;
    const ballots = polls[idPoll].content.ballots;

    return <div className="section">
      { isError && <div className="errorTrx">
        <div className="image"><img src="images/sad-face.svg" width="24" /></div>
        <Typography variant="headline">Transaction failed</Typography>
        <Typography variant="body1">Copy with apologies and invitation to try again</Typography>
        <Link to={"/review/" + idPoll}>
          <Button color="primary" variant="contained">Try again</Button>
        </Link>
      </div> }
      { !isError && <div>
        <h2>TODO: Transaction details here</h2>

        { title }
        { ballots.map((item, i) => {
          return <div key={i}>
            <h2>{item.title}</h2>
            <p>Voters: ???</p>
            <p>Total votes: {poll._quadraticVotes[i]}</p>
            <p>Total SNT: {web3.utils.fromWei(poll._tokenTotal[i], "ether")}</p>

          </div>
        })}

        </div> }
    </div>;
  }
}

export default Results;
