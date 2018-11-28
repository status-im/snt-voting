import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography'

const pad = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

class TitleScreen extends Component {

  state = {
    time: {},
    seconds: -1,
    initTimer: false
  }

  timer = 0

  secondsToTime(secs){
    let days = Math.floor(secs / 86400);
    let divisor_for_hours = secs % 86400;
    let hours = Math.floor(divisor_for_hours / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let obj = {
      "d": days,
      "h": hours,
      "m": minutes
    };

    return obj;
  }

  startTimer() {
    if (this.timer == 0 && this.state.seconds > 0) {
      this.timer = setInterval(() => this.countDown(), 1000);
    }
  }

  countDown() {
    let seconds = this.state.seconds - 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });
    if (seconds == 0) { 
      clearInterval(this.timer);
    }
  }

  componentWillUnmount(){
    clearInterval(this.timer);
  }

  componentDidMount(){
    if(this.props.polls){
      this.initTimer();
    }
  }

  componentDidUpdate(prevProps){
    if (this.props.polls !== prevProps.polls && this.props.polls) {
      this.initTimer();

      const poll = this.props.polls.find(p => p.idPoll == this.props.idPoll);
      if(poll && !poll.content){
        this.props.loadPollContent(poll);
      }
    }
  }

  initTimer(){
    if(!this.props.polls || !this.props.polls.length) return;

    if(this.state.initTimer) return;

    this.setState({initTimer: true});

    const poll = this.props.polls.find(p => p.idPoll == this.props.idPoll);

    const seconds = poll._endTime - (new Date()).getTime() / 1000
    if(seconds > 0){
      let timeLeftVar = this.secondsToTime(seconds);
      this.setState({ time: timeLeftVar, seconds });
      this.startTimer();
    } else {
      this.setState({seconds});
    }
  }

  render(){
    const {time, seconds} = this.state;
    const {polls, idPoll} = this.props;

    if(!polls || !polls.length) return null;
    
    const poll = polls.find(p => p.idPoll == idPoll);
    if(!poll) return null;

    if(!poll.content) return null;

    const title = poll.content.title;
    const description = poll.content.description;
    const canceled = poll._canceled;

    
    return <Fragment>
      <div>
    {!canceled && <div>
      <div className="section" style={{marginBottom: 0}}>
        <img src="images/status-logo.svg" width="36" />
        <Typography variant="headline">{title}</Typography>
        <Typography variant="body1" component="div" dangerouslySetInnerHTML={{__html: description}}></Typography>
      </div>
      <hr />
      { seconds > 0 && <div className="votingTimer">
        <Typography variant="body1">Voting ends in</Typography>
        <ul>
          <li>
            <Typography variant="headline">{pad(time.d, 2)}</Typography>
            <Typography variant="body1" className="timeUnit">Days</Typography>
          </li>
          <li>
            <Typography variant="headline">{pad(time.h, 2)}</Typography>
            <Typography variant="body1" className="timeUnit">Hours</Typography>
          </li>
          <li>
            <Typography variant="headline">{pad(time.m, 2)}</Typography>
            <Typography variant="body1" className="timeUnit">Mins</Typography>
          </li>
        </ul>
        <div className="action">
          <Link to={"/learn/" + idPoll}><Button variant="contained" color="primary">Get started</Button></Link><br />
          <p><Link to={"/results/" + idPoll}>See ongoing results</Link></p>
        </div>
      </div>}
      { seconds < 0 && <div className="pollClosed">
        <Typography variant="headline">Poll closed</Typography>
        <Typography variant="body1">The vote was finished {parseInt(Math.abs(seconds) / 86400, 10)} day(s) ago</Typography>
        <div className="action">
          <Link to={"/results/" + idPoll}><Button variant="contained" color="primary">View results</Button></Link>
        </div>
      </div> }
    </div>}
    </div>
    </Fragment>
    ;
  }
}

export default TitleScreen;
