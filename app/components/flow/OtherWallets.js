import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Fragment} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const OtherWallets = (props) => <Fragment><div className="section">
  <Typography variant="headline">Connect with another wallet</Typography>
  <Typography variant="body1">Do you hold your SNT in another wallet? Don't worry, we've got you covered. You can also vote using the following wallets.</Typography>
  <Card className="card">
    <CardContent>
      <Typography gutterBottom component="h2">
        Connect on Desktop
      </Typography>
      <Typography component="p">
        Send yourself a link to vote using a hardware wallet or a desktop browser extension.
      </Typography>
      <Link to={"/externalWallet/" + props.idPoll}>
      <Button color="primary" variant="contained">
        Send a link
      </Button>
      </Link>
    </CardContent>
  </Card>
  <Card className="card">
    <CardContent>
      <Typography gutterBottom component="h2">
      Connect on mobile
      </Typography>
      <Typography component="p">
        Copy a link to use on a mobile Web3 browser
      </Typography>
      <Link to={"/externalWallet/" + props.idPoll}>
      <Button color="primary" variant="contained">
        Copy link
      </Button>
      </Link>
    </CardContent>
  </Card>
  <Card className="card">
    <CardContent>
      <Typography gutterBottom component="h2">
        SNT on Exchanges
      </Typography>
      <Typography component="p">
      Sorry!, SNT held on exchanges don’t qualify for voting. 
      </Typography>
      <Typography component="p">
      To vote in the next poll, move your tokens to a wallet where you control the private keys.
      </Typography>
    </CardContent>
  </Card>
  </div>
  <div className="buttonNav back">
    <Link to={"/wallet/" + props.idPoll}><Button variant="text">Back</Button></Link>
  </div>
</Fragment>

export default OtherWallets;