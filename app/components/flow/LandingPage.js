import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Link} from "react-router-dom";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withRouter } from 'react-router-dom'
import utils from '../../utils/utils';

// TODO: extract to utils

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
  
    return str;
  
  }

Date.prototype.DDMMYYYY = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
  
    return dd + '/' + MM + '/' + yyyy ;
  };


class LandingPage extends Component {

    state = {
        openPoll: null,
        closedPoll: null
    }

    componentDidMount(){
        this.loadLatestPolls();
    }

    gotoOtherPolls = (type) => () => {
        this.props.resetPollCounter();
        this.props.history.push('/otherPolls/' + type);
    }

    createPoll = async () => {
            if(!window.web3){
              this.props.history.push("/wallet/poll-creation");
              return;
            }
        
            let cont = true;
            if (window.ethereum) {
              try {
                  await ethereum.enable();
                  web3.setProvider(ethereum);
                  const accounts = await web3.eth.getAccounts();
                  web3.eth.defaultAccount = accounts[0];
              } catch (error) {
                cont = false;
              }
            }

            if(cont)
                this.props.history.push('/poll/create');
    }
   

    loadLatestPolls = () => {
        let polls = this.props.polls;

        if(polls && polls.length){
            const openPoll = polls.find(x => !x._canceled && x._endTime > (new Date()).getTime() / 1000);
            if(openPoll)
            EmbarkJS.Storage.get(web3.utils.toAscii(openPoll._description)).then(content => {
                openPoll.content = JSON.parse(content);
                this.setState({openPoll})

                this.props.replacePoll(openPoll);
            })

            const closedPoll = polls.find(x => !x._canceled && x._endTime < (new Date()).getTime() / 1000);
            if(closedPoll)
            EmbarkJS.Storage.get(web3.utils.toAscii(closedPoll._description)).then(content => {
                closedPoll.content = JSON.parse(content);
                this.setState({closedPoll});
                this.props.replacePoll(closedPoll);
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.polls !== prevProps.polls) {
            this.loadLatestPolls();
        }
    }

    render(){
        const { openPoll, closedPoll } = this.state;
        const { decimals } = this.props;

        if(openPoll){
            openPoll._tokenSum = 0;
            openPoll._votesSum = 0;
            for(let i = 0; i < openPoll._numBallots; i++){
                openPoll._tokenSum += parseInt(utils.fromTokenDecimals(openPoll._tokenTotal[i], decimals), 10);
                openPoll._votesSum += parseInt(openPoll._quadraticVotes[i], 10);
            }
        }

        if(closedPoll){
            closedPoll._tokenSum = 0;
            closedPoll._votesSum = 0;
            for(let i = 0; i < closedPoll._numBallots; i++){
                closedPoll._tokenSum += parseInt(utils.fromTokenDecimals(closedPoll._tokenTotal[i], decimals), 10);
                closedPoll._votesSum += parseInt(closedPoll._quadraticVotes[i], 10);
            }
        }

        return <Fragment>
        <div>
            <div className="section" style={{marginBottom: 0}}>
                <img src="images/status-logo.svg" width="36" />
                <Button className="createPollBtn" onClick={this.createPoll}><img src="images/create-poll.svg" width="23" /></Button>
                <Typography variant="headline">Status {this.props.symbol} Voting</Typography>
                <Typography variant="body1" component="div" style={{marginTop: '24px', fontSize: '15px', lineHeight: '22px'}}>Create a poll or vote in one. Your vote helps us decide our product and community direction.</Typography>
            </div>

            { openPoll && openPoll.content &&
                <div className="section" style={{paddingTop: 0, marginBottom: "26px"}}> 
                    <h2 className="pollTypeTitle">Open Polls</h2>
                    <Card className="card poll">
                    <CardContent>
                        <Typography gutterBottom component="h2">{openPoll.content.title}</Typography>
                        <span className="pollClosingDate">Closes: {new Date(openPoll._endTime * 1000).DDMMYYYY()} </span>
                        <p className="stats">
                        Voters: {openPoll._voters}<br />
                        Total votes: {openPoll._votesSum}<br />
                        Total {this.props.symbol}: {openPoll._tokenSum}
                        </p>
                        <Link to={"/titleScreen/" + openPoll.idPoll} className="arrowRightLink">VOTE NOW</Link>
                    </CardContent>
                    </Card>
                    <div style={{textAlign: "center", marginTop: "35px"}}>
                        <a className="landingPageButton" onClick={this.gotoOtherPolls('open')}>More open polls</a>
                    </div>
                </div>
                }
            
            { closedPoll && closedPoll.content &&
                <div className="section" style={{paddingTop: 0}}> 
                    <h2 className="pollTypeTitle">Closed Polls</h2>
                    <Card className="card poll">
                    <CardContent>
                        <Typography gutterBottom component="h2">{closedPoll.content.title}</Typography>
                        <span className="pollClosingDate">Closed: {new Date(closedPoll._endTime * 1000).DDMMYYYY()} </span>
                        <p className="stats">
                        Voters: {closedPoll._voters}<br />
                        Total votes: {closedPoll._votesSum}<br />
                        Total {this.props.symbol}: {closedPoll._tokenSum}<br />
                        </p>
                        <Link to={"/results/" + closedPoll.idPoll} className="arrowRightLink">See results</Link>
                    </CardContent>
                    </Card>
                    <div style={{textAlign: "center", marginTop: "35px"}}>
                        <a className="landingPageButton" onClick={this.gotoOtherPolls('closed')}>More closed polls</a>
                    </div>
                </div>
                }
        </div>



        </Fragment>;
    }
}

export default withRouter(LandingPage);