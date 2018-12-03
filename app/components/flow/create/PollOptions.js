import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';

import Button from '@material-ui/core/Button';


class PollOptions extends Component {

    state = {
        error: ''
    }

    handleChange = (event) => {
        this.setState({error: ''});
        if(event.target.value.length <= 70){
            this.setState({title: event.target.value});
        }
    }

    continue = () => {
        const {title} = this.state;
        const {history} = this.props;

        if(title.trim() != ''){
            this.props.assignToPoll({title});
            history.push('/poll/description');
        } else {
            this.setState({error: "Required"})
        }
    }

    render() {
        return <Fragment>
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1">Add options to the poll</Typography>

            <Button>Add option</Button>

        </div>
        <div className="buttonNav">
            <Button onClick={this.continue}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollOptions);
