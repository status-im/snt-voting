import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DateTimePicker } from 'material-ui-pickers';

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


class PollSchedule extends Component {

    state = {
        selectedDate: (new Date()).addDays(90),
        error: '',
    }

    componentDidMount(){
        if(this.props.poll.selectedDate !== undefined){
            this.setState({endDate: this.props.poll.selectedDate});
        }

        if(!this.props.poll.options){
            const {history} = this.props;
            history.push('/poll/title');
        }
    }

    handleDateChange = date => {
        this.setState({ selectedDate: date });
    };

    continue = () => {
        /*const {description} = this.state;
        const {history} = this.props;

        if(description.trim() != ''){
            this.props.assignToPoll({description});
            history.push('/poll/options');
        } else {
            this.setState({error: "Required"})
        }*/
    }

    render() {
        const { selectedDate } = this.state;

        return <Fragment>
        <LinearProgress variant="determinate" value={77} />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <DateTimePicker
                value={selectedDate}
                disablePast
                autoOk
                ampm={false}
                onChange={this.handleDateChange}
                showTodayButton
            />
            
        </div>
        <div className="buttonNav">
            <Button onClick={this.continue}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollSchedule);
