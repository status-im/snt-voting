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
      this.state.poll = props.polls[0]; // TODO: 
  }

  updatePoll(){
    const idPoll = 0; // TODO: 
    PollManager.methods.poll(idPoll).call().then(poll => {
      this.setState({poll});
    })
  }

  componentDidMount(){
    const {transaction} = this.props;

    const idPoll = 0; // TODO: 

    this.updatePoll();

    transaction.then(receipt => {
      this.updatePoll();
    })
    .catch(err => {
      this.setState({isError: true});
    });
  }

  render(){
    const {polls} = this.props;
    let {isError, poll} = this.state;

    const title = polls[0].content.title;
    const ballots = polls[0].content.ballots;

    if(!poll){
      return null;
    }

    return <div className="section">
      { isError && <div className="errorTrx">
        <div className="image"><img src="images/sad-face.svg" width="24" /></div>
        <Typography variant="headline">Transaction failed</Typography>
        <Typography variant="body1">Copy with apologies and invitation to try again</Typography>
        <Link to="/review">
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
