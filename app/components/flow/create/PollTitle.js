import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';


class PollTitle extends Component {

    state = {
        title: '',
        error: ''
    }

    componentDidMount(){
        if(!web3.eth.defaultAccount){
            this.props.history.push('/');
        }

        if(this.props.poll.title !== undefined){
            this.setState({title: this.props.poll.title});
        } else {
            this.props.assignToPoll({title: ''});
        }
    }

    handleChange = (event) => {
        this.setState({error: ''});
        if(event.target.value.length <= 70){
            this.props.assignToPoll({title: event.target.value});
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
        <LinearProgress variant="determinate" value={19} />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <div style={{marginRight:"24px"}}>
            <TextField
                label="Poll name"
                multiline
                autoFocus={true}
                error={this.state.error != ''}
                className="inputTxt"
                placeholder="E.g. What is the best ice cream flavor?"
                rowsMax="3"
                fullWidth
                value={this.state.title}
                onChange={this.handleChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}      
            />
            </div>
            {this.state.error && <FormHelperText className="errorText">{this.state.error}</FormHelperText>}
            <small>{this.state.title.length} of 70</small>
        </div>
        <div className="buttonNav">
            <Button onClick={this.continue} disabled={this.state.title.trim().length == 0}>Next</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollTitle);
