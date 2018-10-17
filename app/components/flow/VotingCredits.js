import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

class VotingCredits extends Component {

  render(){
    const {polls} = this.props;

    let title, description;

    if(polls && polls.length){
      title = polls[0].content.title;
      description = polls[0].content.description;
    }
    
    return (polls ? <div>
      <div className="section">
        <Typography variant="headline">{title}</Typography>
        <Typography variant="body1" component="div" dangerouslySetInnerHTML={{__html: description}}></Typography>
      </div>
      <Card className="card">
        <CardContent>
            <Typography component="p">
                Voting Credits 300
            </Typography>
            <Typography component="p">
                You get one credit for each SNT held in your wallet <b>at the time of poll was created</b>. They are usable only in this poll.
            </Typography>
        </CardContent>
    </Card>
    <Link to="/voting"><Button variant="text">Vote</Button></Link>


    </div> : null);
  }
}

export default VotingCredits;
