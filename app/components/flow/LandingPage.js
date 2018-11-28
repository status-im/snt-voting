import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'react-router-dom'
import {Link} from "react-router-dom";

class LandingPage extends Component {

    state = {
        openPoll: null,
        closedPoll: null
    }

    componentDidMount(){
        this.loadLatestPolls();
    }

    loadLatestPolls = () => {
        let polls = this.props.polls;
        if(polls && polls.length){
            polls = polls.sort((x,y) => x.idPoll < y.idPoll);
        }

        if(polls && polls.length){
            const openPoll = polls.find(x => !x._cancelled && x._endTime > (new Date()).getTime() / 1000);
            EmbarkJS.Storage.get(web3.utils.toAscii(openPoll._description)).then(content => {
                openPoll.content = JSON.parse(content);
                this.setState({openPoll})

                this.props.replacePoll(openPoll);
            })
            const closedPoll = polls.find(x => !x._cancelled || x._endTime < (new Date()).getTime() / 1000);
            EmbarkJS.Storage.get(web3.utils.toAscii(closedPoll._description)).then(content => {
                closedPoll.content = JSON.parse(content);
                this.setState({closedPoll});
                this.props.replacePoll(openPoll);
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
        
        return <Fragment>
        <div>
            <div className="section" style={{marginBottom: 0}}>
                <img src="images/status-logo.svg" width="36" />
                <Typography variant="headline">Status SNT Voting</Typography>
                <Typography variant="body1" component="div">Create a poll or vote in one. Your vote helps us decide our product and community direction.</Typography>
            </div>

            { openPoll && openPoll.content &&
                <div>
                    <h2>Open Polls</h2>
                    <div>
                        <h3>{openPoll.content.title}</h3>
                        [Closes: 12/12/2018]
                        Voters: 300
                        Total SNT: 50.000
                        {openPoll._description}
                        <Link to={"/titleScreen/" + openPoll.idPoll}><Button variant="contained" color="primary">Vote now</Button></Link>
                    </div>
                    <p>More Open Polls</p>
                </div>
                }
            
            { closedPoll && closedPoll.content &&
                <div>
                    <h2>Closed Polls</h2>
                    <div>
                        <h3>{closedPoll.content.title}</h3>
                        [Closes: 12/12/2018]
                        Voters: 300
                        Total SNT: 50.000
                        {closedPoll._description}
                        Vote Now
                    </div>
                    <p>More Closed Polls</p>
                </div>
                }
        </div>



        </Fragment>;
    }
}

export default LandingPage;