import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import LinearProgress from '@material-ui/core/LinearProgress';

class PollDescription extends Component {
  state = {
    description: '',
    error: ''
  };

  componentDidMount() {
    if (this.props.poll.description !== undefined) {
      this.setState({ description: this.props.poll.description });
    }

    if (!this.props.poll.title) {
      const { history } = this.props;
      history.push('/');
    }
  }

  handleChange = event => {
    this.setState({ error: '' });
    if (event.target.value.length <= 500) {
      this.props.assignToPoll({ description: event.target.value });
      this.setState({ description: event.target.value });
    }
  };

  continue = () => {
    const { description } = this.state;
    const { history } = this.props;

    if (description.trim() != '') {
      this.props.assignToPoll({ description });
      history.push('/poll/options');
    } else {
      this.setState({ error: 'Required' });
    }
  };

  render() {
    return (
      <Fragment>
        <LinearProgress variant="determinate" value={38} />
        <div className="section pollCreation">
          <Typography variant="headline">Create a Poll</Typography>
          <div style={{ marginRight: '24px', marginTop: '8px' }}>
            <TextField
              id="standard-multiline-flexible"
              label="Poll description"
              multiline
              error={this.state.error != ''}
              fullWidth
              autoFocus
              className="inputTxt"
              margin="normal"
              InputLabelProps={{
                shrink: true
              }}
              value={this.state.description}
              onChange={this.handleChange}
            />
          </div>
          {this.state.error && <FormHelperText className="errorText">{this.state.error}</FormHelperText>}
          <small>{this.state.description.length} of 500</small>
        </div>
        <div className="buttonNav">
          <Button onClick={this.continue} disabled={this.state.description.trim().length == 0}>
            Next
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(PollDescription);
