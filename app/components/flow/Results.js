import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography'

class Results extends Component {

  state = {
    isError: false
  }

  componentDidMount(){
    const {transaction} = this.props;

    transaction.then(receipt => {

    })
    .catch(err => {
      this.setState({isError: true});
    })


  }

  render(){
    const {polls} = this.props;
    const {isError} = this.state;

    if(!polls || !polls.length){
      return null;
    }

    return <div className="section">

      { isError && <div>
        <Typography variant="headline">Transaction failed</Typography>
        <Typography variant="body1">Copy with apologies and invitation to try again</Typography>
        <Link to="/review">
          <Button color="primary">Try again</Button>
        </Link>
      </div> }
      { !isError && <div>
        <h2>Transaction details here</h2>
        <h2>Voting results here</h2>
      </div> }
    </div>;
  }
}

export default Results;
