import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const OtherWallets = (props) => <div className="section">
  <Typography variant="headline">Connect with another wallet</Typography>
  <Typography variant="body1">Do you hold your SNT in another wallet? Don't worry, we've got you covered. You can also vote using the following wallets.</Typography>
  <Card>
    <CardContent>
      <Typography gutterBottom component="h2">
        Ledger or Metamask
      </Typography>
      <Typography component="p">
        Text about sending the link to your email account and open it on desktop
        <Button color="primary" variant="contained">
          CALL TO ACTION
        </Button>
      </Typography>
    </CardContent>
  </Card>
  <Card>
    <CardContent>
      <Typography gutterBottom component="h2">
        Web3 wallet / browser
      </Typography>
      <Typography component="p">
        Some explanation and CTA
      </Typography>
    </CardContent>
  </Card>
  <Card>
    <CardContent>
      <Typography gutterBottom component="h2">
        Exchanges
      </Typography>
      <Typography component="p">
        Unfortunately we cannot...
      </Typography>
    </CardContent>
  </Card>
  <Link to="/wallet"><Button variant="text">Back</Button></Link>
</div>

export default OtherWallets;