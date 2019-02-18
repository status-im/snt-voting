import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { InlineDateTimePicker } from 'material-ui-pickers';
import InfiniteCalendar, { Calendar, withRange } from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import { setHours, setMinutes, getHours, getMinutes } from 'date-fns';
import { monthNames, timeValues, timeGroups } from '../../standard/constants';
import TimePickerDialog from './TimePickerDialog';

const CalendarWithRange = withRange(Calendar);

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

class PollSchedule extends Component {
  static propTypes = {
    poll: PropTypes.object,
    assignToPoll: PropTypes.func
  };

  state = {
    endDate: false,
    error: '',
    timeDialog: false,
    timeValues: {
      hour: '00',
      minute: '00',
      ampm: 'AM'
    }
  };

  componentDidMount() {
    const { endDate, options } = this.props.poll;
    if (endDate !== undefined) {
      const minute = `${getMinutes(endDate)}`;
      const hour = `${getHours(endDate)}`;
      const ampm = hour > 12 ? 'PM' : 'AM';
      const timeValues = { hour, minute, ampm };

      this.setState({ endDate: endDate, timeValues });
    } else {
      const currentDate = new Date();
      const hrs = getHours(currentDate);
      const mins = getMinutes(currentDate);
      const minute = mins < 10 ? '0' + mins : `${mins}`;
      let hour = hrs % 12;
      hour = hour ? `${hour}` : 12;
      hour = hour < 10 ? '0' + hour : `${hour}`;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const timeValues = { hour, minute, ampm };
      this.setState({ endDate: new Date().addDays(15), timeValues });
    }

    if (!options) {
      const { history } = this.props;
      history.push('/');
    }
  }

  handleDateChange = date => {
    this.props.assignToPoll({ endDate: date.end });
    this.setState({ endDate: date.end });
  };

  handleTimeChange = (name, value) => {
    const { endDate } = this.state;
    this.setState(({ timeValues }) => ({
      timeValues: {
        ...timeValues,
        [name]: value
      }
    }));
    if (name == 'hour') {
      const updatedHour = setHours(endDate, value);
      this.setState({ endDate: updatedHour });
    } else if (name == 'minute') {
      const updatedMinute = setMinutes(endDate, value);
      this.setState({ endDate: updatedMinute });
    } else {
      let newHour;
      if (value == 'AM') {
        if (getHours(endDate) >= 12) {
          newHour = getHours(endDate) - 12;
          const updatedHour = setHours(endDate, newHour);
          this.setState({ endDate: updatedHour });
        }
      } else {
        if (getHours(endDate) < 12) {
          newHour = getHours(endDate) + 12;
          const updatedHour = setHours(endDate, newHour);
          this.setState({ endDate: updatedHour });
        }
      }
    }
  };

  continue = () => {
    const { endDate } = this.state;
    const { history } = this.props;
    if (endDate != null) {
      this.props.assignToPoll({ endDate: endDate });
      history.push('/poll/review');
    } else {
      this.setState({ error: 'Required' });
    }
  };

  formatAMPM = date => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  };

  toggleTimeDialog = prevState => {
    this.setState({
      timeDialog: !prevState.timeDialog
    });
  };

  closeTimeDialog = () => {
    this.setState({
      timeDialog: false
    });
  };

  render() {
    const { endDate, timeDialog, timeValues } = this.state;
    const today = new Date();

    return (
      <Fragment>
        <LinearProgress variant="determinate" value={77} id="p" />
        <div className="section pollCreation">
          <Typography variant="headline">Create a Poll</Typography>
          <Typography variant="body1" style={{ marginTop: '20px' }}>
            Set the end date and time for the poll.
          </Typography>
          <div>
            <InfiniteCalendar
              height={200}
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
                todayColor: '#4360DF'
              }}
              displayOptions={{
                showHeader: false,
                showTodayHelper: false
              }}
              locale={{
                headerFormat: 'MMM Do'
              }}
            />
          </div>
        </div>
        <div className="buttonNav scheduleNav">
          <div className="end-time-container">
            <div className="endDateTime">
              Ends:
              <div className="endDate">{endDate && `${monthNames[endDate.getMonth()]} ${endDate.getDate()} `}</div>
              <div className="endTime">{endDate && `at ${this.formatAMPM(endDate)}`}</div>
            </div>
            <div className="editTimeText" onClick={this.toggleTimeDialog}>
              Edit Time
            </div>
            <TimePickerDialog
              timeDialog={timeDialog}
              timeValues={timeValues}
              handleTimeChange={this.handleTimeChange}
              closeTimeDialog={this.closeTimeDialog}
            />
          </div>
          <Button onClick={this.continue}>Review</Button>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(PollSchedule);
