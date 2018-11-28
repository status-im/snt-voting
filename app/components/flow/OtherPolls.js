import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Link} from "react-router-dom";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
class OtherPolls extends Component {

    loadIPFSpollContent = async () => {
        for(let i = 0; i < 3; i++){
            await this.props.loadPollContent(this.props.polls[i]);
        } 
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
                        if(p.content){
                            return <Card className="card poll" key={i}>
                            <CardContent>
                                <Typography gutterBottom component="h2">{p.content.title}</Typography>
                                <Typography component="p" dangerouslySetInnerHTML={{__html: p.content.description}}></Typography>
                           <p> [Closes: 12/12/2018]
                                Voters: 300
                                Total SNT: 50.000</p>
                                { pollType == 'open' && <Link to={"/titleScreen/" + p.idPoll} className="arrowRightLink upperCase">Vote now</Link> }
                            </CardContent>
                        </Card>
                        } else {
                            return <Card className="card" key={i}>
                            <CardContent>
                                Loading
                            </CardContent>
                            </Card>
                        }
                    })
                }
           </div>
        </Fragment>;
    }
}

export default OtherPolls;