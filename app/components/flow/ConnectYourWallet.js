import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React from 'react';
import Typography from '@material-ui/core/Typography'

const ConnectYourWallet = (props) => <div className="section center">
  <Typography variant="headline">Connect your wallet</Typography>
  <Typography variant="body1">To start voting, connect to a wallet where you hold your SNT assets.</Typography>
  <div className="action">
    <Link to="/votingCredits">
      <Button color="primary" variant="contained">CONNECT USING STATUS</Button>
    </Link>
  </div>
  <div className="action">
    <Link to="/otherWallets">
      <Button color="primary">CONNECT WITH ANOTHER WALLET</Button>
    </Link>
  </div>
</div>;

export default ConnectYourWallet;
