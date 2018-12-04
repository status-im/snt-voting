import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { InlineDateTimePicker } from 'material-ui-pickers';

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


class PollSchedule extends Component {

    state = {
        endDate: null,
        error: '',
    }

    componentDidMount(){
        if(this.props.poll.endDate !== undefined){
            this.setState({endDate: this.props.poll.endDate});
        } else {
            this.setState({endDate: (new Date()).addDays(90) });
        }

        if(!this.props.poll.options){
            const {history} = this.props;
            history.push('/');
        }
    }

    handleDateChange = date => {
        this.props.assignToPoll({endDate: date});
        this.setState({ endDate: date });
    };

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

    render() {
        const { endDate } = this.state;

        return <Fragment>
        <LinearProgress variant="determinate" value={77} id="p" />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1" style={{marginTop: '20px'}}>Set the end date and time for the poll.</Typography>
            <InlineDateTimePicker
                value={endDate}
                disablePast
                autoOk
                minDate={new Date()}
                ampm={false}
                format="dd/MM/yyyy HH:mm"
                onChange={this.handleDateChange}
            />
        </div>
        <div className="buttonNav">
            <Button onClick={this.continue}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollSchedule);
