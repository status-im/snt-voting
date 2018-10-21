import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withRouter } from 'react-router-dom'

class VotingCredits extends Component {

  componentDidMount(){
    const {polls, balances, history} = this.props;
    if(!polls || !balances || !polls.length || !balances.length){
      history.push('/');
    }
  }

  render(){
    const {polls, balances, idPoll} = this.props;

    if(!polls || !balances) return null;

    let title = polls[idPoll].content.title;
    let description = polls[idPoll].content.description;
    let ethBalance = web3.utils.fromWei(balances[idPoll].ethBalance, "ether");
    let tokenBalance = Math.floor(web3.utils.fromWei(balances[idPoll].tokenBalance, "ether"));
    
    return (polls ? <Fragment><div className="section">
        <Typography variant="headline">{title}</Typography>
        <Typography variant="body1" component="div" dangerouslySetInnerHTML={{__html: description}}></Typography>
      <Card className="card credits">
        <CardContent>
            <Typography component="div">
              <span className="title">Voting Credits</span>
              <span className="value">{tokenBalance}</span>
            </Typography>
            { tokenBalance > 0 &&
            <Typography component="p" className="text">
                You get one credit for each SNT held in your wallet <b>at the time of poll was created</b>. They are usable only in this poll.
            </Typography> }
            { tokenBalance == 0 &&
              <div className="warning">
                <Typography component="h2" >
                  No SNT in your wallet
                </Typography>
                <Typography component="p">
                  To vote, you need to connect with a wallet that holds SNT tokens.
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
                You will sign a transaction to confirm your vote. No tokens are sent, but you need ETH to pay for gas (Ethereum network fee).
              </Typography>
            </div>
          </CardContent>
      </Card> }
    </div>
    <div className={(ethBalance == 0 || tokenBalance == 0) ? 'buttonNav back' : 'buttonNav'}>
      { (ethBalance == 0 || tokenBalance == 0) && <Link to={"/wallet/" + idPoll}><Button variant="text">Back</Button></Link> }
      { (ethBalance > 0 && tokenBalance > 0) && <Link to={"/voting/" + idPoll}><Button variant="text">Vote</Button></Link> }
    </div>
    </Fragment> : null);
  }
}

export default withRouter(VotingCredits);
