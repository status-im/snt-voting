import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
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
    const {polls, balances, history} = this.props;

    if(!polls || !balances) return null;

    let title = polls[0].content.title;
    let description = polls[0].content.description;
    let ethBalance = web3.utils.fromWei(balances[0].ethBalance, "ether");
    let tokenBalance = Math.floor(web3.utils.fromWei(balances[0].tokenBalance, "ether"));
    
    return (polls ? <div>
      <div className="section">
        <Typography variant="headline">{title}</Typography>
        <Typography variant="body1" component="div" dangerouslySetInnerHTML={{__html: description}}></Typography>
      </div>
      <Card className="card">
        <CardContent>
            <Typography component="p">
                Voting Credits {tokenBalance}
            </Typography>
            { tokenBalance > 0 &&
            <Typography component="p">
                You get one credit for each SNT held in your wallet <b>at the time of poll was created</b>. They are usable only in this poll.
            </Typography> }
            { tokenBalance == 0 &&
              <div>
                <Typography component="h2">
                  No SNT in your wallet
                </Typography>
                <Typography component="p">
                  To vote, you need to connect with a wallet that holds SNT tokens.
                </Typography>
                <Typography component="p">
                  <Link to="/otherWallets">Connect with another wallet</Link>
                </Typography>
              </div>
            }
          </CardContent>
      </Card>
      { ethBalance == 0 && <Card className="card">
        <CardContent>
            <Typography component="p">
                ETH {ethBalance}
            </Typography>
            <Typography component="h2">
              Not enough ETH in your wallet
            </Typography>
            <Typography component="p">
              You will sign a transaction to confirm your vote. No tokens are sent, but you need ETH to pay for gas (Ethereum network fee).
            </Typography>
          </CardContent>
      </Card> }
      { ethBalance == 0 || tokenBalance == 0 && <Link to="/wallet"><Button variant="text">Back</Button></Link> }
      { ethBalance > 0 || tokenBalance > 0 &&<Link to="/voting"><Button variant="text">Vote</Button></Link> }
    </div> : null);
  }
}

export default withRouter(VotingCredits);
