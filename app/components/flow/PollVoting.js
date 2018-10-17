import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'

class PollVoting extends Component {

  render(){
    const {polls} = this.props;

    let title;

    if(polls && polls.length){
      title = polls[0].content.title;
      description = polls[0].content.description;
    }
    
    return (polls ? <div>
      <div className="section">
        <Typography variant="headline">{title}</Typography>
      </div>
      
        <Link to="/review"><Button variant="text">Review vote</Button></Link>


    </div> : null);
  }
}

export default PollVoting;
