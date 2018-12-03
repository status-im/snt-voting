import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';


class PollDescription extends Component {

    state = {
        description: '',
        error: ''
    }

    handleChange = (event) => {
        this.setState({error: ''});
        if(event.target.value.length <= 500){
            this.setState({description: event.target.value});
        }
    }

    continue = () => {
        const {description} = this.state;
        const {history} = this.props;

        if(description.trim() != ''){
            this.props.assignToPoll({description});
            history.push('/poll/options');
        } else {
            this.setState({error: "Required"})
        }
    }

    render() {
        return <Fragment>
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <TextField
                id="standard-multiline-flexible"
                label="Poll Description"
                multiline
                error={this.state.error != ''}
                fullWidth
                className="inputTxt"
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}      
                value={this.state.description}
                onChange={this.handleChange}
            />
            {this.state.error && <FormHelperText className="errorText">{this.state.error}</FormHelperText>}
            <small>{this.state.description.length} of 500</small>
        </div>
        <div className="buttonNav">
            <Button onClick={this.continue}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollDescription);
