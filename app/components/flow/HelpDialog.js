
    import React from 'react';
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
    

function Transition(props) {
    return <Slide direction="up" {...props} />;
  }


const HelpDialog = (props) => <Dialog
          fullScreen
          open={props.open}
          onClose={props.handleClose}
          TransitionComponent={Transition}
          className="helpDialog"
        >
          <AppBar style={{position: "relative"}}>
            <Toolbar>
              <IconButton color="inherit" onClick={props.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="display1" color="inherit">
                Need help?
              </Typography>
            </Toolbar>
          </AppBar>
          <Typography variant="display1">What are voting credits?</Typography>
          <Typography variant="body1">Voting Credits are used to purchase votes. The amount of voting credits equals the amount of {props.symbol} you had in the wallet address used to open the Voting Dapp when the poll was created.</Typography>
          <Typography variant="display1">Why do I have zero voting credits?</Typography>
          <Typography variant="body1">You have zero voting credits because the wallet used to open the voting dapp had zero {props.symbol} in it at the time the poll was created.</Typography>
          <Typography variant="display1">Why do votes cost more voting credits for every additional vote?</Typography>
          <Typography variant="body1">The price of votes equals its square in voting credits. This means purchasing the first vote on a ballot costs 1 voting credit, the second vote will require a total of 4 voting credits, the third vote will cost 9 voting credits in total.</Typography>
          <Typography variant="body1">This is done to prevent domination of the vote by large token holders.</Typography>
          <Typography variant="display1">How do I connect with a Tezors or Ledger?</Typography>
          <Typography variant="body1">You may connect with a Ledger or Tezors via the metamask intergration. Information for how to connect to Trezor can be found here: <a href="https://medium.com/metamask/trezor-integration-in-metamask-a8eaeae7f499" target="_blank">https://medium.com/metamask/trezor-integration-in-metamask-a8eaeae7f499</a></Typography>
          <Typography variant="body1">And Ledger here: <a href="https://medium.com/metamask/metamask-now-supports-ledger-hardware-wallets-847f4d51546" target="_blank">https://medium.com/metamask/metamask-now-supports-ledger-hardware-wallets-847f4d51546</a></Typography>
          <Typography variant="body1">Please note that for ledger to work, the ethereum application on ledger needs to be 1.2.4 and above. Please find instructions to do so here: <a href="https://support.ledgerwallet.com/hc/en-us/articles/360009576554-Ethereum-ETH-" target="_blank">https://support.ledgerwallet.com/hc/en-us/articles/360009576554-Ethereum-ETH-</a></Typography>
          <Typography variant="display1">Why do I need to pay ETH to vote?</Typography>
          <Typography variant="body1">Voting is done "on-chain", this means that your vote is written to the ethereum blockchain, ensuring that your vote is transparent and immutable. To write any data to the ethereum blockchain requires miners to validate the transaction. Miner's require an incentive in the form of ETH to mine a transaction.</Typography>
        </Dialog>

  export default HelpDialog;