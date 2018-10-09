import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Grid from '@material-ui/core/Grid';
import { VotingContext } from '../context';
import { ledgerInit, ledgerInstance } from '../ledger';


const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class LedgerAccountList extends PureComponent {
  state = {
    open: false,
    loading: true,
    accounts: []
  };

  handleClickOpen = async () => {
    this.setState({ open: true})
    await ledgerInit()
    console.log(ledgerInstance.accounts)
    if(ledgerInstance.accounts.length)
      this.setState({
        accounts: ledgerInstance.accounts, 
        loading: false
      })
  };

  handleClose = () => {
    this.setState({ open: false })
  };

  handleSelect = (account, setLedgerAccount) => {
    setLedgerAccount(account)
    this.handleClose()
  }

  render() {
    const { classes } = this.props
    const { handleClose } = this
    return (
      <VotingContext.Consumer>
        {({ setLedgerAccount }) =>
          <div>
            <Button color="inherit" variant="outlined" onClick={this.handleClickOpen}>Connect to Ledger</Button>
            <Dialog
              fullScreen
              open={this.state.open}
              onClose={this.handleClose}
              TransitionComponent={Transition}
            >
              <AppBar className={classes.appBar} onClick={this.handleClose}>
                <Toolbar>
                  <IconButton color="inherit" aria-label="Close">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="title" color="inherit" className={classes.flex}>
                    close
                  </Typography>
                </Toolbar>
              </AppBar>
              { this.state.loading ? <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={8}
              >
                <Grid item>
                  <Typography variant="title" color="inherit">
                        <br/>Please connect ledger and select ethereum<br/>   
                  </Typography>
                </Grid>
                <Grid item>
                </Grid>
                <Grid item>
                <Button variant="outlined" onClick={this.handleClickOpen} className={classes.button}>Refresh</Button>
                </Grid>
              </Grid> 
              :
              <List>
                {this.state.accounts.map((account) =>
                  <ListItem key={account.address} button onClick={() => this.handleSelect(account.address, setLedgerAccount)}>
                    <ListItemText primary={account.address} />
                    <Divider />
                  </ListItem>
                )}
              </List>}
            </Dialog>
          </div>
        }
      </VotingContext.Consumer>
    );
  }
}

LedgerAccountList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LedgerAccountList);
