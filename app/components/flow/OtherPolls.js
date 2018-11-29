import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Link} from "react-router-dom";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const pollsPerLoad = 3;


function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
  
    return str;
  
  }

// TODO: extract to utils
Date.prototype.DDMMYYYY = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
  
    return dd + '/' + MM + '/' + yyyy ;
  };

class OtherPolls extends Component {

    state = {
        loading: true
    }

    loadIPFSpollContent = async () => {
        for(let i = this.props.start; i < this.props.end; i++){
            await this.props.loadPollContent(this.props.polls[i]);
            this.setState({loading: false})
        } 
    }
    
    loadMorePolls = async () => {
        this.setState({loading: true})
        this.props.loadMorePolls();
        await this.loadIPFSpollContent();
    }

    componentDidUpdate(prevProps){
        if(this.props.polls !== prevProps.polls){
            this.loadIPFSpollContent();
        }
    }

    componentDidMount(){
        if(this.props.polls && this.props.polls.find(x => x.content != null)){
            this.loadIPFSpollContent();
        }

        // Test scroll
        /*
        window.addEventListener("scroll", () => {
            if(this.state.loading) return;
            const d = document.getElementById('votingDapp');
            if (d.scrollTop + d.clientHeight >= d.scrollHeight) {
                this.loadMorePolls()
            }
        });
        */
    }

    render() {
        let {pollType, polls} = this.props;
        if(!polls){
            return null;
        }

        if(!pollType) pollType = 'open';

        if(polls && polls.length){
            polls = polls.sort((x,y) => x.idPoll < y.idPoll);
            if(pollType == 'open'){
                polls = polls.filter(x => !x._cancelled && x._endTime > (new Date()).getTime() / 1000);
            } else {
                polls = polls.filter(x => x._cancelled || x._endTime < (new Date()).getTime() / 1000);
            }
        }

        return <Fragment>
            <div className="section" style={{marginBottom: 0}}>
                <Typography variant="headline" className="otherPollsTitle">{pollType == 'open' ? 'Open polls' : 'Closed polls'} <small>({polls.length})</small></Typography>               
               {
                    polls.map((p, i) => {

                        if(i >= this.props.end) return null;

                        p._tokenSum = 0;
                        p._votesSum = 0;
                        for(let i = 0; i < p._numBallots; i++){
                            p._tokenSum += parseInt(web3.utils.fromWei(p._tokenTotal[i], "ether"), 10);
                            p._votesSum += parseInt(p._quadraticVotes[i], 10);
                        }
                        if(p.content){
                            return <Card className="card poll" key={i}>
                            <CardContent>
                                <Typography gutterBottom component="h2">{p.content.title}</Typography>
                                <Typography component="p" dangerouslySetInnerHTML={{__html: p.content.description}}></Typography>
                                {pollType == "open" && <span className="pollClosingDate">Closes: {new Date(p._endTime * 1000).DDMMYYYY()}</span> }
                                <p className="stats">
                                Voters: {p._voters}<br />
                                Total votes: {p._votesSum}<br />
                                Total SNT: {p._tokenSum}</p>
                                { pollType == 'open' && <Link to={"/titleScreen/" + p.idPoll} className="arrowRightLink">VOTE NOW</Link> }
                                { pollType != 'open' && <Link to={"/results/" + p.idPoll} className="arrowRightLink">See results</Link> }

                            </CardContent>
                        </Card>
                        } else {
                            return <Card className="card" key={i}>
                            <CardContent>
                                <img src="images/loadIndicator.gif" />
                            </CardContent>
                            </Card>
                        }
                    })
                }

                <div style={{textAlign:"center", marginTop: "40px"}}>
                { polls && polls.length > this.props.end && !this.state.loading && 
                    <a onClick={this.loadMorePolls}  className="landingPageButton">Show more polls</a> }
                </div>
           </div>
        </Fragment>;
    }
}

export default OtherPolls;