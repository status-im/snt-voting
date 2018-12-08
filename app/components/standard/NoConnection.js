import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'
import { withRouter } from 'react-router-dom';
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";

const NoConnection = () => {
  return (
    <Route path="/" render={() => {
      return <div className="section center">
      <Typography variant="headline">Status SNT Voting</Typography>
      <Typography variant="body1">To start voting, connect to a wallet where you hold your SNT</Typography>
      <div className="action">
        <a href="https://get.status.im/browse/vote.status.im"><Button color="primary" variant="contained">CONNECT USING STATUS</Button></a>
      </div>
      <div className="action">
        <Link to={"/connectOtherWallet"}>
          <Button color="primary">USE ANOTHER WALLET</Button>
        </Link>
      </div>
    </div>;
    }} />
  );
};

NoConnection.displayName = "NoConnection";

export default withRouter(NoConnection)
