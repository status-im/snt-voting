
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
          <List>
            <ListItem button>
              <ListItemText primary="Chat on Status" onClick={() => { window.open("https://get.status.im/chat/public/status-snt-voting-dapp",'_blank'); }} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Chat on Telegram" onClick={() => { window.open("https://t.me/StatusNetwork",'_blank'); }} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Chat on Riot" onClick={() => { window.open("https://chat.status.im/#/register",'_blank'); }} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="FAQs" onClick={() => { window.open("https://docs.google.com/document/d/1t7zdjVEH5AfPrH4phpiKuPDCQmnOvvbNoZEY2z2cfzg/edit?usp=sharing",'_blank'); }} />
            </ListItem>
          </List>
        </Dialog>

  export default HelpDialog;