import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import PollManager from 'Embark/contracts/PollManager';

class Results extends Component {

  state = {
    isError: false,
    poll: null,
    isPending: true,
    netId: 3

  }

  constructor(props){
    super(props);

    if(props.polls)
      this.state.poll = props.polls[props.idPoll]; 
  }

  componentDidUpdate(prevProps){
    if (this.props.idPoll !== prevProps.idPoll) {
      this.updatePoll();
    }
  }

  updatePoll(){
    const idPoll = this.props.idPoll; 

    PollManager.methods.poll(idPoll).call().then(poll => {
      this.setState({poll});
    })
  }

  componentDidMount(){
    const {transaction, idPoll, transactionHash} = this.props;

    EmbarkJS.onReady(() => {
      this.updatePoll();

      web3.eth.net.getId((err, netId) => {
        this.setState({netId});
      });

      if(transaction){
        transaction.catch(x => {
          this.setState({isError: true});
        }).then(() => {
          this.updatePoll();
        })

        let req = false;
        let interval = setInterval(async () => {
          if(req || !transactionHash) return;

          req = true;
          const receipt = await web3.eth.getTransactionReceipt(transactionHash);
          if(receipt){
            clearInterval(interval);
            
            if(receipt.status || receipt.status == "0x1"){
              this.setState({isPending: false});
              this.updatePoll();
            } else {
              this.setState({isError: true});
            }
          }
          req = false;
        }, 100);

      }
    });

  }

  render(){
    const {polls, idPoll, transaction, transactionHash} = this.props;
    let {isError, poll, isPending, netId} = this.state;

    if(!poll || !polls){
      return null;
    }

    const title = polls[idPoll].content.title;
    const ballots = polls[idPoll].content.ballots;
    const totalVotes = poll._quadraticVotes.map(x => parseInt(x, 10)).reduce((x, y) => x + y, 0);
    const etherscanURL = netId == 3 ? 'https://ropsten.etherscan.io/tx/' : ( netId == 1 ? "https://etherscan.io/tx/" : '');

    return <Fragment>
      { isError && <div className="errorTrx">
        <div className="image"><img src="images/sad-face.svg" width="24" /></div>
        <Typography variant="headline">Transaction failed</Typography>
        <Typography variant="body1">Your transaction failed to be written to the blockchain. This is usually because of network congestion. Please try again</Typography>
        <Link to={"/review/" + idPoll}>
          <Button color="primary" variant="contained">Try again</Button>
        </Link>
      </div> }

      { !isError && transaction && <div className="transactionArea">
        { isPending && <div className="pending">
           <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
          <Typography variant="headline">Your vote will be posted once the transaction is complete.</Typography>
          <Typography variant="body1">Your vote is in the process of being confirmed in the blockchain</Typography>
        </div>
        }
        { !isPending && transaction && <div className="confirmed">
        <img src="images/confirmed.svg" width="40" />
        <Typography variant="headline">Transaction confirmed!<br />
        Your vote was posted.</Typography>
      </div>}
        { transactionHash && etherscanURL && <Typography variant="body1"><a target="_blank" href={ etherscanURL + transactionHash}>View details on Etherscan</a></Typography> }
        </div>
      }
    <div className="section">
      { !isError && <Fragment>
        <Typography variant="headline" gutterBottom>{title}</Typography>
        { ballots.map((item, i) => <BallotResult title={item.title} totalVotes={totalVotes} quadraticVotes={poll._quadraticVotes[i]} tokenTotal={poll._tokenTotal[i]} totalVoters={poll._votersByBallot[i]} key={i} />) }
        </Fragment>
      }
    </div>
    </Fragment>;
  }
}


class BallotResult extends Component {

  state = {
    show: false
  }

  showDetails = () => {
    const show = this.state.show;
    this.setState({show: !show});
  }

  render(){
    const {title, quadraticVotes, tokenTotal, totalVotes, totalVoters} = this.props;
    const {show} = this.state;

    const votePercentage = totalVotes > 0 ? parseInt(quadraticVotes) / totalVotes * 100 : 0;

    return (<Fragment>
      <Typography gutterBottom component="h2" className="ballotResultTitle" onClick={this.showDetails}>{title}</Typography>
      <div className="ballotResult" onClick={this.showDetails}>
        <div className="progress progress-large result-progress" onClick={this.showDetails}>
          <span style={{width: votePercentage +'%'}}></span>
        </div>
        <span className={show ? 'collapse percentage' : 'percentage'}>{votePercentage.toFixed(2)}%</span>   
    </div>
    {show && <ul className="ballotResultData">
      <Typography component="li">Voters: <span>{totalVoters}</span></Typography>
      <Typography component="li">Total votes: <span>{quadraticVotes}</span></Typography>
      <Typography component="li" className="noBorder">Total SNT: <span>{web3.utils.fromWei(tokenTotal, "ether")}</span></Typography>
    </ul>}
    </Fragment>);
  }

}

export default Results;
