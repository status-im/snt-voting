import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { InlineDateTimePicker } from 'material-ui-pickers';
import InfiniteCalendar, {
    Calendar,
    withRange,
  } from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import TextField from '@material-ui/core/TextField';
import { setHours, setMinutes } from 'date-fns';

const CalendarWithRange = withRange(Calendar);

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class PollSchedule extends Component {

    static propTypes = {
        poll: PropTypes.object,
        assignToPoll: PropTypes.func,

    }

    state = {
        startDate: false,
        endDate: false,
        error: '',
    }

    componentDidMount(){
        if(this.props.poll.endDate !== undefined){
            this.setState({endDate: this.props.poll.endDate});
        } else {
            this.setState({endDate: (new Date()).addDays(15) });
        }

        if(!this.props.poll.options){
            const {history} = this.props;
            history.push('/');
        }
    }

    handleDateChange = date => {
        this.props.assignToPoll({endDate: date.end});
        this.setState({ startDate: date.start, endDate: date.end });
    }

    handleTimeChange = time => {
        if(time.target.value == '') {
            return;
        }
        const newTime = time.target.value.split(':')
        const updatedHour = setHours(this.state.endDate, newTime[0])
        const updatedMinute = setMinutes(updatedHour, newTime[1])
        console.log(updatedHour, updatedMinute)
        this.setState({ endDate: updatedMinute })
        // this.setState({ endDate: updatedHour })
    }

    continue = () => {
        const {endDate} = this.state;
        const {history} = this.props;
        if(endDate != null){
            this.props.assignToPoll({endDate: endDate});
            history.push('/poll/review');
        } else {
            this.setState({error: "Required"})
        }
    }

    formatAMPM = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    render() {
        const { startDate, endDate } = this.state;
        const today = new Date();


        return <Fragment>
        <LinearProgress variant="determinate" value={77} id="p" />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1" style={{marginTop: '20px'}}>Set the end date and time for the poll.</Typography>
              <InfiniteCalendar
                height={475}
                className="schedule-calendar"
                Component={CalendarWithRange}
                min={today}
                minDate={today}
                onSelect={this.handleDateChange}
                selected={{
                    start: today,
                    end: endDate
                }}
                theme={{
                    selectionColor: '#4360DF',
                    accentColor: '#4360DF',
                    todayColor: '#4360DF',
                }}
                displayOptions={{
                    showHeader: false,
                }}
                locale={{
                    headerFormat: 'MMM Do',
                }}
              />
        </div>
        <div className="buttonNav scheduleNav">
            <div className="endDateTime">
                Ends:
                <div className="endDate">
                    { endDate && `${monthNames[endDate.getMonth()]} ${endDate.getDate()} ` }
                </div>
                <div className="endTime">
                    at 
                    { endDate && 
                    <TextField
                        id="time"
                        type="time"
                        defaultValue="12:00"
                        onChange={this.handleTimeChange}
                            InputLabelProps={{
                        shrink: true,
                        }}
                    />}
                </div>
            </div>
            <Button onClick={this.continue}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollSchedule);
